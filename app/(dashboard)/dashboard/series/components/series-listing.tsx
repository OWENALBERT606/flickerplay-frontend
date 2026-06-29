// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Eye, Pencil, Plus, Star } from "lucide-react";
// import type { Series } from "@/actions/series";
// import { DeleteSeriesButton } from "./delete-series-button";

// interface SeriesListingProps {
//   series: Series[];
// }

// export default function SeriesListing({ series }: SeriesListingProps) {
//   const totalSeries = series.length;
//   const trendingCount = series.filter((s) => s.isTrending).length;
//   const comingSoonCount = series.filter((s) => s.isComingSoon).length;
//   const totalViews = series.reduce((sum, s) => sum + Number(s.viewsCount || 0), 0);

//   return (
//     <>
//       {/* Stats Cards */}
//       <div className="grid gap-4 md:grid-cols-4 mb-6">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Series</CardTitle>
//             <span className="text-2xl">📺</span>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{totalSeries}</div>
//             <p className="text-xs text-muted-foreground">All series in catalog</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Views</CardTitle>
//             <span className="text-2xl">👁️</span>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
//             <p className="text-xs text-muted-foreground">Across all series</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Trending</CardTitle>
//             <span className="text-2xl">🔥</span>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{trendingCount}</div>
//             <p className="text-xs text-muted-foreground">Popular series</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Coming Soon</CardTitle>
//             <span className="text-2xl">🎭</span>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{comingSoonCount}</div>
//             <p className="text-xs text-muted-foreground">Upcoming releases</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Series Grid */}
//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between">
//           <CardTitle>All Series</CardTitle>
//           <Link href="/dashboard/series/new">
//             <Button>
//               <Plus className="mr-2 h-4 w-4" />
//               Add Series
//             </Button>
//           </Link>
//         </CardHeader>
//         <CardContent>
//           {series.length === 0 ? (
//             <div className="text-center py-12">
//               <div className="flex flex-col items-center gap-2">
//                 <span className="text-4xl mb-2">📺</span>
//                 <p className="text-muted-foreground">No series found</p>
//                 <Link href="/dashboard/series/new">
//                   <Button variant="outline" size="sm" className="mt-2">
//                     <Plus className="mr-2 h-4 w-4" />
//                     Create your first series
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           ) : (
//             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
//               {series.map((s) => (
//                 <SeriesCard key={s.id} series={s} />
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </>
//   );
// }

// function SeriesCard({ series }: { series: Series }) {
//   const [isHovered, setIsHovered] = useState(false);
//   const viewsCount = Number(series.viewsCount || 0);

//   return (
//     <div
//       className="group relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <div className="relative aspect-[2/3] w-full h-full">
//         <Image
//           src={series.poster}
//           alt={series.title}
//           fill
//           className="object-cover rounded-lg"
//         />

//         {/* Trending Badge */}
//         {series.isTrending && (
//           <div className="absolute top-2 left-2 z-10">
//             <Badge className="bg-red-600 text-white">🔥 Trending</Badge>
//           </div>
//         )}

//         {/* Coming Soon Badge */}
//         {series.isComingSoon && (
//           <div className="absolute top-2 left-2 z-10">
//             <Badge className="bg-blue-600 text-white">Coming Soon</Badge>
//           </div>
//         )}

//         {/* Rating Badge */}
//         <div className="absolute top-2 right-2 z-10">
//           <Badge className="bg-black/70 backdrop-blur-sm border-0">
//             <Star className="w-3 h-3 fill-orange-500 text-orange-500 mr-1" />
//             {series.rating.toFixed(1)}
//           </Badge>
//         </div>

//         {/* Hover Overlay */}
//         {isHovered && (
//           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent">
//             <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
//               <h3 className="text-white font-bold text-sm line-clamp-2">
//                 {series.title}
//               </h3>
//               <div className="text-xs text-white/70 space-y-1">
//                 <div>{series.year.value} • {series.genre.name}</div>
//                 <div>{series.totalSeasons} Seasons • {series.totalEpisodes} Episodes</div>
//                 <div className="flex items-center gap-1">
//                   <Eye className="w-3 h-3" />
//                   {viewsCount.toLocaleString()} views
//                 </div>
//               </div>
//               <div className="flex gap-2 pt-2">
//                 <Button size="sm" variant="secondary" className="flex-1" asChild>
//                   <Link href={`/dashboard/series/${series.id}`}>
//                     <Eye className="w-3 h-3 mr-1" />
//                     View
//                   </Link>
//                 </Button>
//                 <Button size="sm" variant="secondary" className="flex-1" asChild>
//                   <Link href={`/dashboard/series/${series.id}/edit`}>
//                     <Pencil className="w-3 h-3 mr-1" />
//                     Edit
//                   </Link>
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Default Bottom Bar */}
//         {!isHovered && (
//           <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
//             <h3 className="text-white font-semibold text-sm line-clamp-1">
//               {series.title}
//             </h3>
//             <div className="text-xs text-gray-400 mt-1">
//               S{series.totalSeasons} • {series.totalEpisodes} Eps
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Plus, Star, Calendar, Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { Series } from "@/actions/series";
import { DeleteSeriesButton } from "./delete-series-button";

interface SeriesListingProps {
  series: Series[];
}

const PAGE_SIZE = 30;

export default function SeriesListing({ series }: SeriesListingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const filteredSeries = series.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.vj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.genre.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredSeries.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageSeries = filteredSeries.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const totalSeries = series.length;
  const trendingCount = series.filter((s) => s.isTrending).length;
  const comingSoonCount = series.filter((s) => s.isComingSoon).length;
  const totalViews = series.reduce((sum, s) => sum + Number(s.viewsCount || 0), 0);

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Series</CardTitle>
            <span className="text-2xl">📺</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSeries}</div>
            <p className="text-xs text-muted-foreground">All series in catalog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <span className="text-2xl">👁️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all series</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trending</CardTitle>
            <span className="text-2xl">🔥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trendingCount}</div>
            <p className="text-xs text-muted-foreground">Popular series</p>
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

      {/* Series Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle>All Series</CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search series, VJs, or genres..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="pl-8"
              />
            </div>
            <Link href="/dashboard/series/new">
              <Button className="shrink-0">
                <Plus className="mr-2 h-4 w-4" />
                Add Series
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {series.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl mb-2">📺</span>
                <p className="text-muted-foreground">No series found</p>
                <Link href="/dashboard/series/new">
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="mr-2 h-4 w-4" />
                    Create your first series
                  </Button>
                </Link>
              </div>
            </div>
          ) : filteredSeries.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl mb-2">🔍</span>
                <p className="text-muted-foreground">No series matching &ldquo;{searchQuery}&rdquo;</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => setSearchQuery("")}>
                  Clear search
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium">Poster</th>
                    <th className="text-left p-4 font-medium">Title</th>
                    <th className="text-left p-4 font-medium">VJ</th>
                    <th className="text-left p-4 font-medium">Genre</th>
                    <th className="text-left p-4 font-medium">Year</th>
                    <th className="text-left p-4 font-medium">Rating</th>
                    <th className="text-left p-4 font-medium">Seasons</th>
                    <th className="text-left p-4 font-medium">Episodes</th>
                    <th className="text-left p-4 font-medium">Views</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Created</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageSeries.map((s) => (
                    <SeriesRow key={s.id} series={s} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-sm text-muted-foreground">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredSeries.length)} of {filteredSeries.length}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
              .reduce<(number | "…")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground text-sm">…</span>
                ) : (
                  <Button
                    key={p}
                    variant={p === safePage ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8 text-xs"
                    onClick={() => setPage(p as number)}
                  >
                    {p}
                  </Button>
                )
              )}
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function SeriesRow({ series }: { series: Series }) {
  const viewsCount = Number(series.viewsCount || 0);
  const createdDate = new Date(series.createdAt).toLocaleDateString();

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      {/* Poster */}
      <td className="p-4">
        <div className="relative w-16 h-24 rounded-md overflow-hidden">
          <Image
            src={series.poster}
            alt={series.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      </td>

      {/* Title */}
      <td className="p-4">
        <div>
          <Link
            href={`/dashboard/series/${series.id}`}
            className="font-semibold hover:text-orange-500 transition-colors"
          >
            {series.title}
          </Link>
          <div className="text-sm text-muted-foreground mt-1">
            {series.totalSeasons} Season{series.totalSeasons !== 1 ? 's' : ''} • {series.totalEpisodes} Episode{series.totalEpisodes !== 1 ? 's' : ''}
          </div>
        </div>
      </td>

      {/* VJ */}
      <td className="p-4">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={series.vj.avatarUrl}
              alt={series.vj.name}
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
          <span className="text-sm">{series.vj.name}</span>
        </div>
      </td>

      {/* Genre */}
      <td className="p-4">
        <Badge variant="outline">{series.genre.name}</Badge>
      </td>

      {/* Year */}
      <td className="p-4">
        <span className="text-sm">{series.year.value}</span>
      </td>

      {/* Rating */}
      <td className="p-4">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{series.rating.toFixed(1)}</span>
        </div>
      </td>

      {/* Seasons */}
      <td className="p-4">
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
          {series.totalSeasons}
        </Badge>
      </td>

      {/* Episodes */}
      <td className="p-4">
        <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">
          {series.totalEpisodes}
        </Badge>
      </td>

      {/* Views */}
      <td className="p-4">
        <Badge variant="secondary" className="bg-gray-500/10">
          {viewsCount}
        </Badge>
      </td>

      {/* Status */}
      <td className="p-4">
        {series.isComingSoon ? (
          <Badge className="bg-blue-600">Coming Soon</Badge>
        ) : series.isTrending ? (
          <Badge className="bg-orange-600">Trending</Badge>
        ) : (
          <Badge variant="outline">Active</Badge>
        )}
      </td>

      {/* Created */}
      <td className="p-4">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {createdDate}
        </div>
      </td>

      {/* Actions */}
      <td className="p-4">
        <div className="flex items-center justify-end gap-2">
          <Link href={`/dashboard/series/${series.id}`}>
            <Button variant="ghost" size="sm" title="View details">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/dashboard/series/${series.id}/edit`}>
            <Button variant="ghost" size="sm" title="Edit series">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <DeleteSeriesButton series={series} variant="ghost" />
        </div>
      </td>
    </tr>
  );
}