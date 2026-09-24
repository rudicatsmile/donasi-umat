import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is not configured yet (local mock development), allow seamless inspection
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("placeholder-project")) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protect Dashboard routes
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isFundraiserRoute = pathname.startsWith("/galang-dana/kampanye-baru") ||
    pathname.startsWith("/galang-dana/kampanye-saya") ||
    pathname.startsWith("/galang-dana/verifikasi-identitas") ||
    pathname.startsWith("/galang-dana/riwayat-pencairan");
  const isAdminRoute = pathname.startsWith("/admin");

  if (!user && (isDashboardRoute || isFundraiserRoute || isAdminRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // If user is authenticated, check admin restriction
  if (user && isAdminRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/galang-dana/kampanye-baru/:path*",
    "/galang-dana/kampanye-saya/:path*",
    "/galang-dana/verifikasi-identitas/:path*",
    "/galang-dana/riwayat-pencairan/:path*",
    "/admin/:path*",
  ],
};
