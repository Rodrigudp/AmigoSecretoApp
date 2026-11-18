import type { Metadata } from "next";
import { LegalDocument } from "../_components/LegalDocument";
import { copy } from "../_lib/copy";
import { legalMetadata } from "../_lib/legal-metadata";
import { getAppUrl } from "../_lib/site-url";

const page = copy.LEG.contato;

export const metadata: Metadata = legalMetadata({
  title: page.title,
  path: "/contato",
  description: page.description,
});

export default function ContatoPage() {
  const siteUrl = getAppUrl();
  return (
    <LegalDocument title={page.title} sections={page.sections}>
      <p className="leading-7">
        {page.siteLabel}{" "}
        <a className="text-primary-soft-text underline underline-offset-4" href={siteUrl}>
          {siteUrl}
        </a>
      </p>
    </LegalDocument>
  );
}
