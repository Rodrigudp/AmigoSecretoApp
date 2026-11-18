type JsonLdProps = {
  data: Record<string, unknown>;
};

/** Inline JSON-LD structured data (schema.org). */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
