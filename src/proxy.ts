import { type NextRequest, NextResponse } from "next/server";

const CANONICAL_HOST = process.env.CANONICAL_HOST ?? "mcpeakfamily.org";

export function proxy(request: NextRequest): NextResponse {
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  const host = request.headers.get("host") ?? "";
  const hostWithoutPort = host.split(":")[0] ?? "";
  const proto = request.headers.get("x-forwarded-proto");
  const url = request.nextUrl.clone();

  const needsHttps = proto === "http";
  const needsWwwRedirect = hostWithoutPort === `www.${CANONICAL_HOST}`;

  if (needsHttps || needsWwwRedirect) {
    url.protocol = "https:";
    url.hostname = CANONICAL_HOST;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
