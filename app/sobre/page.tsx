import type { Metadata } from "next";
import { LegalDocument } from "../_components/LegalDocument";
import { copy } from "../_lib/copy";
import { legalMetadata } from "../_lib/legal-metadata";

const page = copy.LEG.sobre;

export const metadata: Metadata = legalMetadata({
  title: page.title,
  path: "/sobre",
  description: page.description,
});

export default function SobrePage() {
  return <LegalDocument title={page.title} sections={page.sections} />;
}
