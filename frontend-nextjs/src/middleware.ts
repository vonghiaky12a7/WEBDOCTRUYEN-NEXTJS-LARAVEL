import { NextRequest, NextResponse } from "next/server";

// Define protected routes and allowed roles
const protectedRoutes = [
  { path: "/admin", allowedRoles: [1] }, // Only admin (roleId: 1) can access
  { path: "/profile", allowedRoles: [1, 3] }, // Both admin and reader can access
];

// Define authentication-related routes
const authRoutes = ["/auth/signin", "/auth/register"];

// Define the API endpoint for token verification
const API_VERIFY_TOKEN_ENDPOINT = "http://localhost:8000/api/auth/verify-token"; // Replace with your actual API endpoint

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the current route is a protected route
  const protectedRoute = protectedRoutes.find(
    (route) => pathname === route.path || pathname.startsWith(`${route.path}/`)
  );
  const isProtectedRoute = Boolean(protectedRoute);

  // Check if the current route is an authentication route
  const isAuthRoute = authRoutes.includes(pathname);

  // Get the token from the cookie
  const token = request.cookies.get("auth_token")?.value;

  console.log("🔹 Middleware: token:", token ? "Exists" : "Not found");
  console.log("🔹 token:", token);

  if (!token) {
    // If no token, block access to protected routes
    if (isProtectedRoute) {
      console.log("🔴 No token found, redirecting to /auth/signin");
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  } else {
    // If token exists, verify it with the backend API
    try {
      const response = await fetch(API_VERIFY_TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("🔹 Response data:", data);

      if (response.ok) {
        const user = data.user;
        const userRole = user.roleId;
        if (isAuthRoute) {
          // If already logged in, redirect away from auth routes
          console.log("🟢 Already logged in, redirecting to /");
          return NextResponse.redirect(new URL("/", request.url));
        }

        if (isProtectedRoute) {
          // Check access based on role
          const allowedRoles = protectedRoute?.allowedRoles || [];
          if (!allowedRoles.includes(userRole)) {
            console.log(`🔴 No access to ${pathname}, redirecting to /`);
            return NextResponse.redirect(new URL("/", request.url));
          }
        }
      } else {
        // Token is invalid
        console.log("🔴 Invalid token, redirecting to /auth/signin");
        return NextResponse.redirect(new URL("/auth/signin", request.url));
      }
    } catch (error) {
      // Network error or API error
      console.error("🔴 Error verifying token:", error);
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  // Allow access if none of the above conditions are met
  return NextResponse.next();
}

// Middleware configuration
export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/auth/signin",
    "/auth/register",
  ],
};
