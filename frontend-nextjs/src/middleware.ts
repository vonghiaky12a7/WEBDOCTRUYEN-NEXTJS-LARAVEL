import { NextRequest, NextResponse } from "next/server";

// Định nghĩa các route cần bảo vệ và vai trò được phép truy cập
const protectedRoutes = [
  { path: "/admin", allowedRoles: [1] }, // Chỉ admin (roleId: 1) được phép truy cập
  { path: "/profile", allowedRoles: [1, 3] }, // Cho phép cả admin và reader
];

// Định nghĩa các route liên quan đến xác thực
const authRoutes = ["/auth/signin", "/auth/signup", "/auth/google/callback"];

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Kiểm tra xem route hiện tại có phải là route cần bảo vệ không
  const protectedRoute = protectedRoutes.find(
    (route) => pathname === route.path || pathname.startsWith(`${route.path}/`)
  );
  const isProtectedRoute = Boolean(protectedRoute);
  const isAuthRoute = authRoutes.includes(pathname);

  // Lấy giá trị của cookie 'laravel_session' và 'role_id'
  const laravelSession = request.cookies.get("laravel_session")?.value;
  const roleId = request.cookies.get("role_id")?.value;

  console.log(
    "🔹 Middleware: laravel_session:",
    laravelSession ? "Exists" : "Not found"
  );
  console.log("🔹 Middleware: role_id:", roleId || "Not found");

  if (!laravelSession) {
    // Nếu không có laravel_session, chặn truy cập vào các route cần bảo vệ
    if (isProtectedRoute) {
      console.log(" Không có laravel_session, chuyển hướng đến /auth/signin");
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  } else {
    const userRole = Number(roleId);

    if (isAuthRoute) {
      // Không cho phép truy cập trang đăng nhập khi đã đăng nhập
      return NextResponse.redirect(
        new URL(userRole === 1 ? "/admin/user" : "/", request.url)
      );
    }

    if (isProtectedRoute) {
      // Kiểm tra quyền truy cập dựa trên role_id
      const allowedRoles = protectedRoute?.allowedRoles || [];
      if (!allowedRoles.includes(userRole)) {
        console.log(
          ` Không có quyền truy cập vào ${pathname}, chuyển hướng về trang chủ.`
        );
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return NextResponse.next();
}

// Cấu hình matcher cho Middleware
export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/auth/:path*", "/"],
};
