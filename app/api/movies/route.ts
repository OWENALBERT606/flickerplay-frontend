import { NextRequest, NextResponse } from "next/server";
import { listMovies } from "@/actions/movies";
import { listTulabeMovies, normalizeTulabeMovie } from "@/actions/tulabe";
import type { Movie } from "@/actions/movies";

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

  const hasFilters = !!(genre || vj || year || search || trending || comingSoon || dubbed || sort);

  try {
    // Fetch backend movies and (when unfiltered) Tulabe movies in parallel
    const [backendResult, tulabeResult] = await Promise.allSettled([
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
      hasFilters ? Promise.resolve({ movies: [], pagination: null }) : listTulabeMovies(page),
    ]);

    const backendData = backendResult.status === "fulfilled" ? backendResult.value : { data: [], pagination: undefined };
    const tulabeData  = tulabeResult.status  === "fulfilled" ? tulabeResult.value  : { movies: [], pagination: null };

    let movies: Movie[] = backendData.data || [];
    const pagination = backendData.pagination;

    // Client-side dubbed filter
    if (dubbed === "yes") movies = movies.filter(m => !!m.vjId && !!m.vj?.name);
    else if (dubbed === "no") movies = movies.filter(m => !m.vjId || !m.vj?.name);

    // Client-side sort
    if (sort === "rating") movies = [...movies].sort((a, b) => b.rating - a.rating);

    // Interleave Tulabe movies (1 after every 3 backend movies) when unfiltered
    if (!hasFilters && tulabeData.movies?.length > 0) {
      const tulabeMovies: Movie[] = tulabeData.movies.map(normalizeTulabeMovie);
      const mixed: Movie[] = [];
      let ti = 0;
      for (let i = 0; i < movies.length; i++) {
        mixed.push(movies[i]);
        if ((i + 1) % 3 === 0 && ti < tulabeMovies.length) {
          mixed.push(tulabeMovies[ti++]);
        }
      }
      while (ti < tulabeMovies.length) mixed.push(tulabeMovies[ti++]);
      movies = mixed;
    }

    // Total pages = max of backend and Tulabe page counts
    const backendTotalPages = pagination?.totalPages ?? 1;
    const tulabeTotalPages  = tulabeData.pagination?.total_pages ?? 1;
    const totalPages = hasFilters ? backendTotalPages : Math.max(backendTotalPages, tulabeTotalPages);

    return NextResponse.json({
      movies,
      page:       pagination?.page       ?? page,
      totalPages,
      total:      (pagination?.total ?? movies.length),
    });
  } catch (e: any) {
    return NextResponse.json({ movies: [], page, totalPages: 1, total: 0 }, { status: 500 });
  }
}
