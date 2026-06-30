import { NextRequest, NextResponse } from "next/server";
import { getDiscoverySection, getContinueWatchingSection, getRecommendedSection } from "@/actions/movies-discovery";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const section  = searchParams.get("section") ?? "";
  const genre    = searchParams.get("genre")   ?? undefined;
  const userId   = searchParams.get("userId")  ?? undefined;
  const page     = parseInt(searchParams.get("page")  || "1");
  const limit    = parseInt(searchParams.get("limit") || "18");
  const search   = searchParams.get("search") || undefined;

  try {
    if (section === "continue-watching") {
      if (!userId) return NextResponse.json({ data: [], total: 0, page, totalPages: 1 }, { status: 400 });
      const result = await getContinueWatchingSection(userId, { page, limit });
      return NextResponse.json(result);
    }

    if (section === "recommended") {
      if (!userId) return NextResponse.json({ data: [], total: 0, page, totalPages: 1 }, { status: 400 });
      const result = await getRecommendedSection(userId, { page, limit });
      return NextResponse.json(result);
    }

    if (!["new", "trending", "top-rated", "recent", "genre"].includes(section)) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

    const result = await getDiscoverySection(
      section as "new" | "trending" | "top-rated" | "recent" | "genre",
      { page, limit, genre, search }
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ data: [], total: 0, page, totalPages: 1 }, { status: 500 });
  }
}
