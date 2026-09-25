/**
 * Structured data for search engines, as a <script type="application/ld+json">.
 *
 * `JSON.stringify` alone is not safe here: a value containing `</script>`
 * (a product title or description typed by a merchant) would close the tag
 * and let the rest run as HTML. Escaping every `<` as < keeps the JSON
 * identical to parsers while making that impossible.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
