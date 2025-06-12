import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Public routes that don't require authentication
    const publicPaths = ["/card", "/login", "/auth"]
    const isPublicPath = publicPaths.some((path) => req.nextUrl.pathname.startsWith(path))

    // If it's a public path, allow access without authentication
    if (isPublicPath) {
      return res
    }

    // Protected routes
    const protectedPaths = ["/dashboard"]
    const isProtectedPath = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))

    // If accessing protected route without session, redirect to login
    if (isProtectedPath && !session) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // If accessing root path, handle based on authentication status
    if (req.nextUrl.pathname === "/") {
      if (session) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      } else {
        return NextResponse.redirect(new URL("/login", req.url))
      }
    }
  } catch (error) {
    console.error("Middleware error:", error)
    // On error, allow the request to continue
    return res
  }

  return res
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/login", "/card/:path*"],
}
