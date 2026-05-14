"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Plus, Play, Star, Search } from "lucide-react";
import type { Movie } from "@/actions/movies";
import { DeleteMovieButton } from "./delete-movie-button";

interface MovieListingProps {
  movies: Movie[];
}

export default function MovieListing({ movies }: MovieListingProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.vj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.genre.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMovies = movies.length;
  const trendingCount = movies.filter((m) => m.isTrending).length;
  const comingSoonCount = movies.filter((m) => m.isComingSoon).length;
  const totalViews = movies.reduce((sum, m) => sum + Number(m.viewsCount || 0), 0);

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Movies</CardTitle>
            <span className="text-2xl">🎬</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMovies}</div>
            <p className="text-xs text-muted-foreground">All movies in catalog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <span className="text-2xl">👁️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all movies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trending</CardTitle>
            <span className="text-2xl">🔥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trendingCount}</div>
            <p className="text-xs text-muted-foreground">Popular movies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coming Soon</CardTitle>
            <span className="text-2xl">🎭</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comingSoonCount}</div>
            <p className="text-xs text-muted-foreground">Upcoming releases</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>All Movies</CardTitle>
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search movies, VJs, or genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Poster</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>VJ</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl mb-2">🎬</span>
                      <p className="text-muted-foreground">
                        {searchQuery ? `No movies matching "${searchQuery}"` : "No movies found"}
                      </p>
                      {!searchQuery && (
                        <Link href="/dashboard/movies/new">
                          <Button variant="outline" size="sm" className="mt-2">
                            <Plus className="mr-2 h-4 w-4" />
                            Create your first movie
                          </Button>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMovies.map((movie) => (
                  <TableRow key={movie.id}>
                    <TableCell>
                      <div className="relative w-16 h-24 rounded overflow-hidden">
                        <Image
                          src={movie.poster || movie.image}
                          alt={movie.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{movie.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {movie.length || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <Image
                            src={movie.vj.avatarUrl}
                            alt={movie.vj.name}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        </div>
                        <span className="text-sm">{movie.vj.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{movie.genre.name}</Badge>
                    </TableCell>
                    <TableCell>{movie.year.value}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{movie.rating.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {Number(movie.viewsCount).toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {movie.isTrending && (
                          <Badge variant="default" className="text-xs">
                            Trending
                          </Badge>
                        )}
                        {movie.isComingSoon && (
                          <Badge variant="secondary" className="text-xs">
                            Coming Soon
                          </Badge>
                        )}
                        {!movie.isTrending && !movie.isComingSoon && (
                          <Badge variant="outline" className="text-xs">
                            Available
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(movie.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/movies/${movie.id}`}>
                          <Button variant="ghost" size="sm" title="View details">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/movies/${movie.id}/edit`}>
                          <Button variant="ghost" size="sm" title="Edit movie">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteMovieButton movie={movie} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}