import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("accessToken")?.value;
    const role = request.cookies.get("userRole")?.value;

    if (!token || role !== "ADMIN") {
      // Langsung redirect ke homepage, bukan ke login page
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};