import type { Metadata } from "next";
import { createGroupAction } from "./actions";
import { CreateGroupForm } from "./_components/CreateGroupForm";
import { JsonLd } from "./_components/JsonLd";
import { APP_NAME } from "./_lib/brand";
import { publicPageMetadata } from "./_lib/public-metadata";
import { getAppUrl } from "./_lib/site-url";

export const metadata: Metadata = publicPageMetadata({
  title: "Amigo secreto online — Papelzinho",
  description: "Organize seu amigo secreto em 2 minutos, sem cadastro e sem senha.",
  path: "/",
});

export default function Home() {
  const origin = getAppUrl();

  return (
    <main id="conteudo" tabIndex={-1} className="page-shell page-shell--wide">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: APP_NAME,
          url: origin,
          inLanguage: "pt-BR",
        }}
      />
      <CreateGroupForm action={createGroupAction} />
    </main>
  );
}
