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
      if (parsed.protocol !== "https:") {
        return false;
      }
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
 * Serviço que orquestra os adapters de afiliado (Amazon).
 * O Mercado Livre foi removido pelo PO em 18/11 (D1) e opera como link comum.
 */
export class CompositeAffiliateLinkService implements AffiliateLinkService {
  private readonly amazon: AmazonAffiliateAdapter;

  constructor(options?: { amazonTag?: string }) {
    this.amazon = new AmazonAffiliateAdapter(
      options?.amazonTag ? { associateTag: options.amazonTag } : undefined
    );
  }

  async convert(url: string): Promise<{ affiliateUrl: string; store: AffiliateStore } | null> {
    if (this.amazon.supports(url)) {
      const converted = this.amazon.convert(url);
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
