// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // This function now only runs for authenticated routes.
    // We check if the user is an ADMIN.
    if (req.nextauth.token?.role !== "ADMIN") {
      // If not an admin, rewrite to the access denied page.
      return NextResponse.rewrite(new URL("/auth/denied", req.url));
    }
  },
  {
    callbacks: {
      // This callback determines if the user is authorized to access the matched routes.
      // If it returns false, the user is redirected to the sign-in page.
      authorized: ({ token }) => !!token,
    },
  }
);

// --- SIMPLIFIED MATCHER ---
export const config = {
  // This protects the dashboard and all its sub-pages.
  matcher: ["/dashboard/:path*"],
};
// -------------------------