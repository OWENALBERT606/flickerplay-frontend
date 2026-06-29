import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { listMovies } from "@/actions/movies";
import MovieListing from "./components/movie-listing";

export default async function MoviesPage() {
  const moviesData = await listMovies({ limit: 5000 });
  const movies = moviesData.data || [];
  const totalMoviesCount = moviesData.pagination?.total ?? movies.length;

  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Movies</h1>
          <p className="text-muted-foreground mt-2">
            Manage your movie collection
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/movies/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Movie
          </Link>
        </Button>
      </div>

      <MovieListing movies={movies} totalCount={totalMoviesCount} />
    </div>
  );
}