import { NextResponse } from "next/server";

const FRAME_ANCESTORS =
  "frame-ancestors 'self' https://pierre-dev-seven.vercel.app http://localhost:5500 http://127.0.0.1:5500";

export function middleware() {
  const response = NextResponse.next();

  // Remove X-Frame-Options (browsers ignore invalid/empty; CSP frame-ancestors controls embedding)
  response.headers.delete("x-frame-options");
  response.headers.set("Content-Security-Policy", FRAME_ANCESTORS);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
