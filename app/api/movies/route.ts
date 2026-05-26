import { NextRequest, NextResponse } from "next/server";
import { listMovies } from "@/actions/movies";
import type { Movie } from "@/actions/movies";
import { listLabaMovies, normalizeLabaMovie } from "@/actions/labafilm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const page       = parseInt(searchParams.get("page") || "1");
  const genre      = searchParams.get("genre");
  const vj         = searchParams.get("vj");
  const year       = searchParams.get("year");
  const search     = searchParams.get("search");
  const trending   = searchParams.get("trending");
  const comingSoon = searchParams.get("coming_soon");
  const dubbed     = searchParams.get("dubbed");
  const sort       = searchParams.get("sort");

  // Only hit LabaFilm API when no category/vj/year/trending/coming-soon filter is active
  // (LabaFilm API doesn't support those filters)
  const shouldFetchLaba = !genre && !vj && !year && !trending && !comingSoon;

  try {
    const [result, labaResult] = await Promise.all([
      listMovies({
        page,
        limit: 24,
        genreId:      genre      && genre      !== "all" ? genre      : undefined,
        vjId:         vj         && vj         !== "all" ? vj         : undefined,
        yearId:       year       && year       !== "all" ? year       : undefined,
        search:       search     || undefined,
        isTrending:   trending   === "1" ? true : undefined,
        isComingSoon: comingSoon === "1" ? true : undefined,
      }),
      shouldFetchLaba ? listLabaMovies(page) : Promise.resolve({ movies: [], pagination: null }),
    ]);

    let movies: Movie[] = result.data || [];
    const pagination = result.pagination;

    // Collect externalIds already represented in DB results so we don't show duplicates
    const dbExternalIds = new Set(
      movies.map((m) => m.externalId).filter(Boolean)
    );

    // Normalize LabaFilm movies and drop any already in the DB
    let labaMovies = labaResult.movies
      .filter((m) => !dbExternalIds.has(m._id))
      .map(normalizeLabaMovie);

    // Apply search filter client-side for LabaFilm results
    if (search) {
      const q = search.toLowerCase();
      labaMovies = labaMovies.filter((m) =>
        m.title.toLowerCase().includes(q)
      );
    }

    // Append LabaFilm extras after DB movies
    movies = [...movies, ...labaMovies];

    if (dubbed === "yes") movies = movies.filter((m) => !!m.vjId && !!m.vj?.name);
    else if (dubbed === "no") movies = movies.filter((m) => !m.vjId || !m.vj?.name);

    if (sort === "rating") movies = [...movies].sort((a, b) => b.rating - a.rating);

    // Extend totalPages so infinite scroll continues as long as either source has more
    const dbTotalPages = pagination?.totalPages ?? 1;
    const labaTotalPages = labaResult.pagination?.total_pages ?? 1;
    const totalPages = shouldFetchLaba
      ? Math.max(dbTotalPages, labaTotalPages)
      : dbTotalPages;

    const dbTotal   = pagination?.total ?? 0;
    const labaTotal = shouldFetchLaba ? (labaResult.pagination?.total ?? 0) : 0;
    const combinedTotal = labaTotal > dbTotal ? labaTotal : dbTotal + labaTotal || movies.length;

    return NextResponse.json({
      movies,
      page:       pagination?.page ?? page,
      totalPages,
      total:      combinedTotal,
    });
  } catch {
    return NextResponse.json({ movies: [], page, totalPages: 1, total: 0 }, { status: 500 });
  }
}
