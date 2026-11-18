import type { AffiliateLinkService, AffiliateStore } from "../../application/ports";

export type AmazonAffiliateConfig = {
  associateTag: string;
};

export const DEFAULT_AMAZON_ASSOCIATE_TAG = "papelzinho20-20";

const ALLOWED_REDIRECT_HOSTS = [
  "amazon.com.br",
  "www.amazon.com.br",
  "mercadolivre.com.br",
  "www.mercadolivre.com.br",
  "produto.mercadolivre.com.br",
];

/**
 * Adapter para Amazon Associados Brasil (amazon.com.br).
 * - Aceita URLs de produto na amazon.com.br ou www.amazon.com.br
 * - Valida se a URL aponta para produto via ASIN (/dp/<ASIN> ou /gp/product/<ASIN>)
 * - Adiciona ou substitui o parâmetro tag=<associateTag>
 * - Preserva todos os demais parâmetros e paths sem encurtamento
 */
export class AmazonAffiliateAdapter {
  readonly store: AffiliateStore = "amazon";
  private readonly associateTag: string;

  constructor(config?: Partial<AmazonAffiliateConfig>) {
    this.associateTag =
      config?.associateTag ||
      process.env.AMAZON_ASSOCIATE_TAG ||
      DEFAULT_AMAZON_ASSOCIATE_TAG;
  }

  supports(rawUrl: string): boolean {
    try {
      const parsed = new URL(rawUrl);
      const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
      if (host !== "amazon.com.br") {
        return false;
      }
      return this.hasProductAsin(parsed.pathname);
    } catch {
      return false;
    }
  }

  convert(rawUrl: string): { affiliateUrl: string; store: AffiliateStore } | null {
    if (!this.supports(rawUrl)) {
      return null;
    }

    try {
      const parsed = new URL(rawUrl);
      parsed.searchParams.set("tag", this.associateTag);
      return {
        affiliateUrl: parsed.toString(),
        store: this.store,
      };
    } catch {
      return null;
    }
  }

  private hasProductAsin(pathname: string): boolean {
    const dpRegex = /\/dp\/([A-Za-z0-9]{10})(?:[/?#]|$)/;
    const gpRegex = /\/gp\/product\/([A-Za-z0-9]{10})(?:[/?#]|$)/;
    return dpRegex.test(pathname) || gpRegex.test(pathname);
  }
}

/**
 * Adapter para Mercado Livre.
 * Enquanto o cadastro do domínio não for aprovado (PEN-04 / D1),
 * opera em modo passthrough sem comissão (devolve null para manter o link original).
 */
export class MercadoLivreAffiliateAdapter {
  readonly store: AffiliateStore = "mercadolivre";

  supports(rawUrl: string): boolean {
    try {
      const parsed = new URL(rawUrl);
      const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
      return host === "mercadolivre.com.br" || host === "produto.mercadolivre.com.br";
    } catch {
      return false;
    }
  }

  convert(): { affiliateUrl: string; store: AffiliateStore } | null {
    return null;
  }
}

/**
 * Serviço que orquestra a cadeia de adapters de afiliado (Strategy pattern).
 */
export class CompositeAffiliateLinkService implements AffiliateLinkService {
  private readonly amazon: AmazonAffiliateAdapter;
  private readonly ml: MercadoLivreAffiliateAdapter;

  constructor(options?: { amazonTag?: string }) {
    this.amazon = new AmazonAffiliateAdapter(
      options?.amazonTag ? { associateTag: options.amazonTag } : undefined
    );
    this.ml = new MercadoLivreAffiliateAdapter();
  }

  async convert(url: string): Promise<{ affiliateUrl: string; store: AffiliateStore } | null> {
    if (this.amazon.supports(url)) {
      const converted = this.amazon.convert(url);
      if (converted) return converted;
    }

    if (this.ml.supports(url)) {
      const converted = this.ml.convert();
      if (converted) return converted;
    }

    return null;
  }

  canRedirect(destinationUrl: string): boolean {
    try {
      const parsed = new URL(destinationUrl);
      if (parsed.protocol !== "https:") return false;
      const hostname = parsed.hostname.toLowerCase();
      return ALLOWED_REDIRECT_HOSTS.includes(hostname);
    } catch {
      return false;
    }
  }
}
