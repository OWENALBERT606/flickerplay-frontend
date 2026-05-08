import { NextRequest, NextResponse } from "next/server";
import { listMovies } from "@/actions/movies";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const page        = parseInt(searchParams.get("page") || "1");
  const genre       = searchParams.get("genre");
  const vj          = searchParams.get("vj");
  const year        = searchParams.get("year");
  const search      = searchParams.get("search");
  const trending    = searchParams.get("trending");
  const comingSoon  = searchParams.get("coming_soon");
  const dubbed      = searchParams.get("dubbed");
  const sort        = searchParams.get("sort");

  try {
    const result = await listMovies({
      page,
      limit: 24,
      genreId:      genre      && genre      !== "all" ? genre      : undefined,
      vjId:         vj         && vj         !== "all" ? vj         : undefined,
      yearId:       year       && year       !== "all" ? year       : undefined,
      search:       search     || undefined,
      isTrending:   trending   === "1" ? true : undefined,
      isComingSoon: comingSoon === "1" ? true : undefined,
    });

    let movies = result.data || [];
    const pagination = result.pagination;

    // Client-side dubbed filter
    if (dubbed === "yes") movies = movies.filter(m => !!m.vjId && !!m.vj?.name);
    else if (dubbed === "no") movies = movies.filter(m => !m.vjId || !m.vj?.name);

    // Client-side sort
    if (sort === "rating") movies = [...movies].sort((a, b) => b.rating - a.rating);

    return NextResponse.json({
      movies,
      page:       pagination?.page       ?? page,
      totalPages: pagination?.totalPages ?? 1,
      total:      pagination?.total      ?? movies.length,
    });
  } catch (e: any) {
    return NextResponse.json({ movies: [], page, totalPages: 1, total: 0 }, { status: 500 });
  }
}
