

// "use client"

// import { useState } from "react"
// import { Star, Eye, HardDrive, Clock, Calendar, Plus, Share2, Download } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"

// interface Movie {
//   id: number
//   title: string
//   description: string
//   rating: number
//   year: number
//   genre: string
//   vj?: string
//   views: string
//   size: string
//   length: string
//   director: string
//   cast: string[]
//   trailerUrl: string
//   trailerPoster: string
// }

// interface MovieInfoProps {
//   movie: Movie
// }

// export function MovieInfo({ movie }: MovieInfoProps) {
//   const [isInList, setIsInList] = useState(false)

//   return (
//     <div className="space-y-8">
//       {/* Title and Actions */}
//       <div className="space-y-4">
//         <div className="flex items-start justify-between">
//           <div className="space-y-2">
//             <h1 className="text-4xl font-bold text-foreground text-balance">{movie.title}</h1>
//             <div className="flex items-center space-x-4 text-muted-foreground">
//               <div className="flex items-center space-x-1">
//                 <Star className="w-5 h-5 fill-primary text-primary" />
//                 <span className="font-semibold text-foreground">{movie.rating}</span>
//               </div>
//               <span>•</span>
//               <span>{movie.year}</span>
//               <span>•</span>
//               <span>{movie.length}</span>
//               <span>•</span>
//               <Badge variant="outline" className="border-primary/20 text-primary">
//                 {movie.genre}
//               </Badge>
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex items-center space-x-3">
//           <Button
//             size="lg"
//             onClick={() => setIsInList(!isInList)}
//             variant={isInList ? "outline" : "default"}
//             className={isInList ? "border-primary/20" : "bg-primary hover:bg-primary/90 golden-glow"}
//           >
//             <Plus className="w-5 h-5 mr-2" />
//             {isInList ? "In My List" : "Add to List"}
//           </Button>
//           <Button size="lg" variant="outline" className="border-border bg-transparent">
//             <Share2 className="w-5 h-5 mr-2" />
//             Share
//           </Button>
//           <Button size="lg" variant="outline" className="border-border bg-transparent">
//             <Download className="w-5 h-5 mr-2" />
//             Download
//           </Button>
//         </div>
//       </div>

//       {/* Movie Stats */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         <div className="bg-card border border-border rounded-lg p-4 space-y-2">
//           <div className="flex items-center space-x-2 text-muted-foreground">
//             <Eye className="w-4 h-4" />
//             <span className="text-sm">Views</span>
//           </div>
//           <p className="text-2xl font-bold text-foreground">{movie.views}</p>
//         </div>

//         <div className="bg-card border border-border rounded-lg p-4 space-y-2">
//           <div className="flex items-center space-x-2 text-muted-foreground">
//             <HardDrive className="w-4 h-4" />
//             <span className="text-sm">File Size</span>
//           </div>
//           <p className="text-2xl font-bold text-foreground">{movie.size}</p>
//         </div>

//         <div className="bg-card border border-border rounded-lg p-4 space-y-2">
//           <div className="flex items-center space-x-2 text-muted-foreground">
//             <Clock className="w-4 h-4" />
//             <span className="text-sm">Duration</span>
//           </div>
//           <p className="text-2xl font-bold text-foreground">{movie.length}</p>
//         </div>

//         <div className="bg-card border border-border rounded-lg p-4 space-y-2">
//           <div className="flex items-center space-x-2 text-muted-foreground">
//             <Calendar className="w-4 h-4" />
//             <span className="text-sm">Release Year</span>
//           </div>
//           <p className="text-2xl font-bold text-foreground">{movie.year}</p>
//         </div>
//       </div>

//       {/* Description and Details */}
//       <div className="grid md:grid-cols-3 gap-8">
//         <div className="md:col-span-2 space-y-6">
//           <div>
//             <h2 className="text-2xl font-bold text-foreground mb-3">Synopsis</h2>
//             <p className="text-muted-foreground leading-relaxed text-pretty">{movie.description}</p>
//           </div>

//           {/* Trailer */}
//           <div>
//             <h2 className="text-2xl font-bold text-foreground mb-3">Trailer</h2>
//             <div className="relative aspect-video bg-card rounded-lg overflow-hidden border border-border">
//               <video controls poster={movie.trailerPoster} className="w-full h-full">
//                 <source src={movie.trailerUrl} type="video/mp4" />
//               </video>
//             </div>
//           </div>
//         </div>

//         <div className="space-y-6">
//           <div className="bg-card border border-border rounded-lg p-6 space-y-4">
//             <div>
//               <h3 className="text-sm font-semibold text-muted-foreground mb-2">Director</h3>
//               <p className="text-foreground">{movie.director}</p>
//             </div>

//             <div>
//               <h3 className="text-sm font-semibold text-muted-foreground mb-2">Cast</h3>
//               <div className="space-y-1">
//                 {movie.cast.map((actor, index) => (
//                   <p key={index} className="text-foreground">
//                     {actor}
//                   </p>
//                 ))}
//               </div>
//             </div>

//             {movie.vj && (
//               <div>
//                 <h3 className="text-sm font-semibold text-muted-foreground mb-2">Translated By</h3>
//                 <Badge className="bg-primary/10 text-primary border-primary/20">{movie.vj}</Badge>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }




"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Calendar, Clock, Eye } from "lucide-react";
import type { Movie } from "@/actions/movies";

interface MovieInfoProps {
  movie: Movie;
}

export function MovieInfo({ movie }: MovieInfoProps) {
  const viewsCount = Number(movie.viewsCount || 0);

  return (
    <div className="space-y-8">
      {/* Title and Meta */}
      <div>
        <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
        
        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{movie.year.value}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{movie.length || "N/A"}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{movie.rating.toFixed(1)}/10</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{viewsCount.toLocaleString()} views</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{movie.genre.name}</Badge>
          {movie.isTrending && <Badge>Trending</Badge>}
          {movie.isComingSoon && <Badge variant="outline">Coming Soon</Badge>}
        </div>
      </div>

      {/* Description */}
      <div>
        <h2 className="text-2xl font-semibold mb-3">Description</h2>
        <p className="text-muted-foreground leading-relaxed">
          {movie.description || "No description available."}
        </p>
      </div>

      {/* VJ Info */}
      <div>
        <h2 className="text-2xl font-semibold mb-3">Video Jockey</h2>
        {movie.vj.name !== "Unknown VJ" && movie.vj.name !== "Translated" ? (
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-14 w-14 ring-2 ring-background">
              <AvatarImage src={movie.vj.avatarUrl} alt={movie.vj.name} />
              <AvatarFallback>
                {movie.vj.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-lg">{movie.vj.name}</div>
              {movie.vj.bio && (
                <div className="text-sm text-muted-foreground">{movie.vj.bio}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-muted/50 rounded-lg">
            <span className="text-base font-medium">Translated</span>
          </div>
        )}
      </div>

      {/* Director */}
      {movie.director && (
        <div>
          <h2 className="text-2xl font-semibold mb-3">Director</h2>
          <p className="text-lg">{movie.director}</p>
        </div>
      )}

      {/* Cast */}
      {movie.cast && movie.cast.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-3">Cast</h2>
          <div className="flex flex-wrap gap-2">
            {movie.cast.map((actor, index) => (
              <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                {actor}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Genre</div>
          <div className="font-semibold">{movie.genre.name}</div>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Year</div>
          <div className="font-semibold">{movie.year.value}</div>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Duration</div>
          <div className="font-semibold">{movie.length || "N/A"}</div>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">File Size</div>
          <div className="font-semibold">{movie.size || "N/A"}</div>
        </div>
      </div>
    </div>
  );
}