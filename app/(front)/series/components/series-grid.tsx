// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Play, Plus, Star } from "lucide-react";
// import type { Series } from "@/actions/series";

// interface SeriesGridProps {
//   series: Series[];
//   userId?: string | null;
// }

// export function SeriesGrid({ series,userId }: SeriesGridProps) {
//   const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

//   if (series.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <p className="text-xl text-muted-foreground">No series found</p>
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
//       {series.map((s) => (
//         <div
//           key={s.id}
//           className="group cursor-pointer"
//           onMouseEnter={() => setHoveredSeries(s.id)}
//           onMouseLeave={() => setHoveredSeries(null)}
//         >
//           <div className="relative overflow-hidden rounded-lg bg-card transition-transform duration-300 group-hover:scale-105 group-hover:z-10">
//             <div className="relative aspect-[2/3] w-full">
//               <Image
//                 src={s.poster}
//                 alt={s.title}
//                 fill
//                 className="object-cover"
//                 sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16.66vw"
//               />
//             </div>

//             {/* Hover Overlay */}
//             <div
//               className={`absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity duration-300 ${
//                 hoveredSeries === s.id ? "opacity-100" : "opacity-0"
//               }`}
//             >
//               <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
//                 <div className="flex items-center justify-between gap-1">
//                   <div className="flex items-center space-x-1">
//                     <Button 
//                       size="sm" 
//                       className="bg-orange-500 hover:bg-orange-600 h-7 w-7 p-0" 
//                       asChild
//                     >
//                       <Link href={`/series/${s.slug}`}>
//                         <Play className="w-3 h-3 fill-white" />
//                       </Link>
//                     </Button>
//                     <Button
//                       title="Add to my list"
//                       size="sm"
//                       variant="outline"
//                       className="border-white/20 hover:bg-white/20 bg-white/10 h-7 w-7 p-0"
//                     >
//                       <Plus className="w-3 h-3" />
//                     </Button>
//                   </div>
//                   <div className="flex items-center space-x-1 text-orange-500">
//                     <Star className="w-3 h-3 fill-current" />
//                     <span className="text-xs font-medium">{s.rating.toFixed(1)}</span>
//                   </div>
//                 </div>

//                 <div className="space-y-0.5">
//                   <h3 className="font-semibold text-white text-balance line-clamp-2 text-xs leading-tight">
//                     {s.title}
//                   </h3>
//                   <div className="flex items-center space-x-1.5 text-[10px] text-white/70">
//                     <span>{s.year.value}</span>
//                     <span>•</span>
//                     <span className="truncate">{s.genre.name}</span>
//                   </div>
//                   <div className="text-[10px] text-white/60">
//                     {s.totalSeasons} Season{s.totalSeasons !== 1 ? 's' : ''} • {s.totalEpisodes} Eps
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Badges */}
//             {s.isTrending && (
//               <div className="absolute top-2 left-2 z-10">
//                 <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-semibold rounded">
//                   🔥 Trending
//                 </span>
//               </div>
//             )}

//             {s.isComingSoon && (
//               <div className="absolute top-2 left-2 z-10">
//                 <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-semibold rounded">
//                   Coming Soon
//                 </span>
//               </div>
//             )}

//             <div className="absolute top-2 right-2 z-10">
//               <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5">
//                 <Star className="w-2.5 h-2.5 fill-orange-500 text-orange-500" />
//                 <span className="text-[10px] font-bold text-white">{s.rating.toFixed(1)}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }




"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Star, Clock } from "lucide-react";
import type { Series } from "@/actions/series";
import { AddToListButton } from "../../movies/components/add-to-list-button";

interface SeriesGridProps {
  series: Series[];
  userId?: string | null;
}

export function SeriesGrid({ series, userId }: SeriesGridProps) {
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

  if (series.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-muted-foreground">No series found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
      {series.map((s) => (
        <div
          key={s.id}
          className="group cursor-pointer relative overflow-hidden rounded-lg bg-card transition-transform duration-300 hover:scale-105 hover:z-10"
          onMouseEnter={() => setHoveredSeries(s.id)}
          onMouseLeave={() => setHoveredSeries(null)}
        >
          {/* Poster Image */}
          <div className="relative aspect-[2/3] w-full">
            <Link href={s.isComingSoon ? "#" : `/series/${s.slug}`}>
              <Image
                src={s.poster}
                alt={s.title}
                fill
                className={`object-cover rounded-lg ${s.isComingSoon ? "grayscale group-hover:grayscale-0" : ""}`}
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16.66vw"
              />

              {/* Gradient Overlay (Always visible at bottom) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-lg pointer-events-none" />

              {/* Title & Info (Always visible) */}
              <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
                <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">
                  {s.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <span>{s.year.value}</span>
                  <span>•</span>
                  <span>{s.genre.name}</span>
                </div>
                <p className="text-xs text-white/70 mt-1">
                  {s.totalSeasons} Season{s.totalSeasons !== 1 ? "s" : ""} • {s.totalEpisodes} Eps
                </p>
                {s.vj && (
                  <p className="text-xs text-white/70">
                    VJ {s.vj.name}
                  </p>
                )}
              </div>
            </Link>

            {/* Action Buttons - Only visible on hover */}
            <div className="absolute bottom-16 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-auto">
              {/* Play/Coming Soon Button */}
              {s.isComingSoon ? (
                <Button 
                  className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 p-0 flex items-center justify-center"
                  disabled
                  title="Coming Soon"
                >
                  <Clock className="h-5 w-5 text-white" />
                </Button>
              ) : (
                <Link href={`/series/${s.slug}`}>
                  <Button 
                    className="h-10 w-10 rounded-full bg-orange-500 hover:bg-orange-600 p-0 flex items-center justify-center"
                    title="Play"
                  >
                    <Play className="h-5 w-5 text-white fill-white" />
                  </Button>
                </Link>
              )}

              {/* Add to List Button */}
              <AddToListButton
                itemId={s.id}
                type="series"
                userId={userId || undefined}
                variant="secondary"
                size="icon"
                showText={false}
                className="h-10 w-10 rounded-full bg-gray-800/80 hover:bg-gray-700 border-0 backdrop-blur-sm"
              />

              {/* Download Button (Optional) */}
              <Button 
                className="h-10 w-10 rounded-full bg-gray-800/80 hover:bg-gray-700 p-0 flex items-center justify-center border-0 backdrop-blur-sm"
                title="Download"
              >
                <svg 
                  className="h-5 w-5 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                  />
                </svg>
              </Button>
            </div>

            {/* Rating Badge (Top Right) */}
            <div className="absolute top-3 right-3 z-10">
              <div className="flex items-center gap-1 bg-orange-500 text-white border-0 rounded px-2 py-1">
                <Star className="h-3 w-3 fill-white text-white" />
                <span className="font-bold text-xs">{s.rating.toFixed(1)}</span>
              </div>
            </div>

            {/* Trending Badge (Top Left) */}
            {s.isTrending && !s.isComingSoon && (
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded flex items-center gap-1">
                  <span>🔥</span>
                  <span>Trending</span>
                </span>
              </div>
            )}

            {/* Coming Soon Badge (Top Left) */}
            {s.isComingSoon && (
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded animate-pulse flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Coming Soon</span>
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}