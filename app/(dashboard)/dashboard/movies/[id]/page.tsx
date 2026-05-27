import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Pencil, Star, Eye, Clock, Calendar, Film, Play, User, TrendingUp } from "lucide-react";
import { getMovie } from "@/actions/movies";
import { formatDate } from "@/lib/format-date";
import { DeleteMovieButton } from "../components/delete-movie-button";

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const movieData = await getMovie(id);
  const movie = movieData.data;

  if (!movie) {
    notFound();
  }

  const viewsCount = Number(movie.viewsCount || 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/dashboard/movies">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Movies
          </Link>
        </Button>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Poster */}
          <div className="lg:col-span-1">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-4 border-background">
              <Image
                src={movie.poster || movie.image}
                alt={movie.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button variant="default" asChild className="flex-1">
                <Link href={`/dashboard/movies/${movie.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Movie
                </Link>
              </Button>
              <DeleteMovieButton movie={movie} variant="destructive" />
            </div>
          </div>

          {/* Movie Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Meta */}
            <div>
              <h1 className="text-5xl font-bold tracking-tight mb-4">{movie.title}</h1>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {movie.genre.name}
                </Badge>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {movie.year.value}
                </Badge>
                {movie.isTrending && (
                  <Badge className="text-sm px-3 py-1">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Trending
                  </Badge>
                )}
                {movie.isComingSoon && (
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    Coming Soon
                  </Badge>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-lg text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{movie.year.value}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{movie.length || "N/A"}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-foreground">{movie.rating.toFixed(1)}/10</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  <span>{viewsCount.toLocaleString()} views</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {movie.description || "No description available"}
                </p>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Eye className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-3xl font-bold">{viewsCount.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground mt-1">Views</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <Star className="h-8 w-8 mx-auto mb-2 fill-yellow-400 text-yellow-400" />
                  <div className="text-3xl font-bold">{movie.rating.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground mt-1">Rating</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <Film className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-3xl font-bold">{movie.size || "N/A"}</div>
                  <p className="text-sm text-muted-foreground mt-1">File Size</p>
                </CardContent>
              </Card>
            </div>

            {/* Media Buttons */}
            {(movie.trailerUrl || movie.videoUrl) && (
              <div className="flex gap-3">
                {movie.trailerUrl && (
                  <Button variant="outline" asChild className="flex-1">
                    <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer">
                      <Play className="mr-2 h-4 w-4" />
                      Watch Trailer
                    </a>
                  </Button>
                )}
                {movie.videoUrl && (
                  <Button asChild className="flex-1">
                    <a href={movie.videoUrl} target="_blank" rel="noopener noreferrer">
                      <Film className="mr-2 h-4 w-4" />
                      Watch Full Movie
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Detailed Information */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Cast & Crew */}
          <Card>
            <CardHeader>
              <CardTitle>Cast & Crew</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* VJ */}
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Video Jockey</div>
                {movie.vj.name !== "Unknown VJ" && movie.vj.name !== "Translated" ? (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Avatar className="h-12 w-12 ring-2 ring-background">
                      <AvatarImage src={movie.vj.avatarUrl} alt={movie.vj.name} />
                      <AvatarFallback>
                        {movie.vj.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{movie.vj.name}</div>
                      {movie.vj.bio && (
                        <div className="text-sm text-muted-foreground line-clamp-1">{movie.vj.bio}</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="font-semibold">Translated</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Director */}
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Director</div>
                <div className="text-base font-semibold">{movie.director || "N/A"}</div>
              </div>

              {/* Cast */}
              {movie.cast && movie.cast.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Cast</div>
                    <div className="flex flex-wrap gap-2">
                      {movie.cast.map((actor, index) => (
                        <Badge key={index} variant="outline" className="px-3 py-1">
                          <User className="mr-1 h-3 w-3" />
                          {actor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Movie Details */}
          <Card>
            <CardHeader>
              <CardTitle>Movie Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Genre</div>
                  <div className="text-base font-semibold">{movie.genre.name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Release Year</div>
                  <div className="text-base font-semibold">{movie.year.value}</div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Duration</div>
                  <div className="text-base">{movie.length || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">File Size</div>
                  <div className="text-base">{movie.size || "N/A"}</div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Status</div>
                  <Badge variant={movie.isComingSoon ? "secondary" : "default"}>
                    {movie.isComingSoon ? "Coming Soon" : "Available"}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Trending</div>
                  <Badge variant={movie.isTrending ? "default" : "outline"}>
                    {movie.isTrending ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Created</div>
                  <div className="text-sm">{formatDate(movie.createdAt)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Last Updated</div>
                  <div className="text-sm">{formatDate(movie.updatedAt)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Poster Gallery */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Poster Gallery</CardTitle>
            <CardDescription>All available poster images</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm font-medium mb-2">Main Image</div>
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden border shadow-lg hover:shadow-xl transition-shadow">
                  <Image
                    src={movie.image}
                    alt={`${movie.title} image`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Poster</div>
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden border shadow-lg hover:shadow-xl transition-shadow">
                  <Image
                    src={movie.poster}
                    alt={`${movie.title} poster`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Trailer Poster</div>
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden border shadow-lg hover:shadow-xl transition-shadow">
                  <Image
                    src={movie.trailerPoster}
                    alt={`${movie.title} trailer poster`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}