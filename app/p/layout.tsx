import type { Metadata } from "next";
import { tokenOnlyMetadata } from "../_lib/token-page-meta";

export const metadata: Metadata = tokenOnlyMetadata("Área do participante");

export default function ParticipantLayout({ children }: { children: React.ReactNode }) {
  return children;
}
