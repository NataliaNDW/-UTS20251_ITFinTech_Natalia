import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper untuk log di development
const log = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

// Helper untuk get user dari cookie
const getUserFromCookie = (request: NextRequest) => {
  const userCookie = request.cookies.get("user");
  log("Cookie found:", userCookie?.value);
  
  if (!userCookie?.value) {
    return null;
  }

  try {
    const user = JSON.parse(userCookie.value);
    log("Parsed user data:", user);
    return user;
  } catch (error) {
    console.error("Error parsing user cookie:", error);
    return null;
  }
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  log("\n=== Middleware Debug ===");
  log("Request URL:", request.url);
  log("Pathname:", pathname);

  // Hanya proses admin routes
  if (!pathname.startsWith("/admin")) {
    log("Not an admin route, skipping...");
    return NextResponse.next();
  }

  // Get user dari cookie
  const user = getUserFromCookie(request);

  // Tidak ada user atau cookie corrupt
  if (!user) {
    log("No valid user found, redirecting to login");
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    return response;
  }

  log("User:", { name: user.name, email: user.email, role: user.role });

  // Cek role admin
  if (user.role !== "admin") {
    log("User is not admin, access denied");
    const response = NextResponse.redirect(new URL("/", request.url));
    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    return response;
  }

  log("Admin access granted ✓");
  const response = NextResponse.next();
  // Prevent caching for admin routes
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  return response;
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*'
  ]
};