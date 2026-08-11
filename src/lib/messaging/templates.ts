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
  const html = [
    `<p>You're invited to the McPeak family directory: <a href="${url}">${url}</a></p>`,
    "<p>Sign in, then complete the reunion survey if prompted.</p>",
  ].join("");

  return { subject, text, html };
}

export function siteLinkSmsContent(siteUrl?: string): string {
  const url = resolveSiteUrl(siteUrl);
  return `McPeak family site: ${url} — sign in to update info / reunion survey.`;
}
