import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
 
export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken");
 
  if (!accessToken && !request.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
 
  if (accessToken && request.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
 
  return NextResponse.next();
}
 
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
