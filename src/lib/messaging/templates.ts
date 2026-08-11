const DEFAULT_SITE_URL = "https://mcpeakfamily.org";

export function resolveSiteUrl(siteUrl?: string): string {
  const value = (
    siteUrl ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    DEFAULT_SITE_URL
  )
    .trim()
    .replace(/\/$/, "");
  return value.length > 0 ? value : DEFAULT_SITE_URL;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Turn plain-text blast body into simple HTML paragraphs; auto-link http(s) URLs. */
export function plainTextToSimpleHtml(text: string): string {
  const paragraphs = text
    .split(/\n+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  return paragraphs
    .map((paragraph) => {
      const escaped = escapeHtml(paragraph);
      const withLinks = escaped.replace(
        /(https?:\/\/[^\s<]+)/g,
        (url) => `<a href="${url}">${url}</a>`,
      );
      return `<p>${withLinks}</p>`;
    })
    .join("");
}

export function siteLinkEmailContent(siteUrl?: string): {
  subject: string;
  text: string;
  html: string;
} {
  const url = resolveSiteUrl(siteUrl);
  const subject = "McPeak family directory";
  const text = [
    `You're invited to the McPeak family directory: ${url}`,
    "Sign in, then complete the reunion survey if prompted.",
  ].join("\n");
  const html = plainTextToSimpleHtml(text);

  return { subject, text, html };
}

export function siteLinkSmsContent(siteUrl?: string): string {
  const url = resolveSiteUrl(siteUrl);
  return `McPeak family site: ${url} — sign in to update info / reunion survey.`;
}
