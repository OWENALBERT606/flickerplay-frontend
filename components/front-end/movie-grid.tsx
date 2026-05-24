// "use client"

// import { useState } from "react"
// import { Play, Star, Info } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import Link from "next/link"

// interface Movie {
//   id: number
//   title: string
//   image: string
//   rating: number
//   year: number
//   genre: string
//   vj?: string
//   views: string
//   size: string
//   length: string
// }

// interface MovieGridProps {
//   movies: Movie[]
// }

// export function MovieGrid({ movies }: MovieGridProps) {
//   const [hoveredMovie, setHoveredMovie] = useState<number | null>(null)

//   if (movies.length === 0) {
//     return (
//       <div className="text-center py-20">
//         <p className="text-muted-foreground text-lg">No movies found matching your filters.</p>
//       </div>
//     )
//   }

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//       {movies.map((movie) => (
//         <div
//           key={movie.id}
//           className="group cursor-pointer"
//           onMouseEnter={() => setHoveredMovie(movie.id)}
//           onMouseLeave={() => setHoveredMovie(null)}
//         >
//           <div className="relative overflow-hidden rounded-lg bg-card transition-transform duration-300 group-hover:scale-105">
//             <img src={movie.image || "/placeholder.svg"} alt={movie.title} className="w-full h-96 object-cover" />

//             {/* VJ Badge */}
//             {movie.vj && (
//               <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full">
//                 <span className="text-xs font-semibold text-primary-foreground">{movie.vj}</span>
//               </div>
//             )}

//             {/* Rating Badge */}
//             <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md flex items-center space-x-1">
//               <Star className="w-3 h-3 fill-primary text-primary" />
//               <span className="text-xs font-semibold text-white">{movie.rating}</span>
//             </div>

//             {/* Hover Overlay */}
//             <div
//               className={`absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent transition-opacity duration-300 ${
//                 hoveredMovie === movie.id ? "opacity-100" : "opacity-0"
//               }`}
//             >
//               <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
//                 <div className="space-y-2">
//                   <h3 className="font-semibold text-white text-balance line-clamp-2">{movie.title}</h3>
//                   <div className="flex items-center space-x-2 text-sm text-white/70">
//                     <span>{movie.year}</span>
//                     <span>•</span>
//                     <span>{movie.genre}</span>
//                     <span>•</span>
//                     <span>{movie.length}</span>
//                   </div>
//                   <div className="flex items-center space-x-2 text-xs text-white/60">
//                     <span>{movie.views} views</span>
//                     <span>•</span>
//                     <span>{movie.size}</span>
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-2">
//                   <Link href={`/movies/${movie.id}`} className="flex-1">
//                     <Button size="sm" className="w-full bg-primary hover:bg-primary/90 golden-glow">
//                       <Play className="w-4 h-4 mr-2" />
//                       Watch Now
//                     </Button>
//                   </Link>
//                   <Link href={`/movies/${movie.id}`}>
//                     <Button size="sm" variant="outline" className="border-white/20 hover:bg-white/10 bg-transparent">
//                       <Info className="w-4 h-4" />
//                     </Button>
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   )
// }


"use client"

import { useState } from "react"
import { Play, Star, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Movie {
  id: number
  title: string
  image: string
  rating: number
  year: number
  genre: string
  vj?: string
  views: string
  size: string
  length: string
}

interface MovieGridProps {
  movies: Movie[]
}

export function MovieGrid({ movies }: MovieGridProps) {
  const [hoveredMovie, setHoveredMovie] = useState<number | null>(null)

  if (movies.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">No movies found matching your filters.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2">
      {movies.map((movie) => (
        <div
          key={movie.id}
          className="group cursor-pointer"
          onMouseEnter={() => setHoveredMovie(movie.id)}
          onMouseLeave={() => setHoveredMovie(null)}
        >
          <div className="relative overflow-hidden rounded-lg bg-card transition-transform duration-300 group-hover:scale-105">
            <img src={movie.image || "/placeholder.svg"} alt={movie.title} className="w-full h-64 object-cover" />

            {/* VJ Badge */}
            {movie.vj && (
              <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-xs font-semibold text-primary-foreground">{movie.vj}</span>
              </div>
            )}

            {/* Rating Badge */}
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md flex items-center space-x-1">
              <Star className="w-3 h-3 fill-primary text-primary" />
              <span className="text-xs font-semibold text-white">{movie.rating}</span>
            </div>

            {/* Hover Overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent transition-opacity duration-300 ${
                hoveredMovie === movie.id ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
                <div className="space-y-2">
                  <h3 className="font-semibold text-white text-balance line-clamp-2">{movie.title}</h3>
                  <div className="flex items-center space-x-2 text-sm text-white/70">
                    <span>{movie.year}</span>
                    <span>•</span>
                    <span>{movie.genre}</span>
                    <span>•</span>
                    <span>{movie.length}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-white/60">
                    <span>{movie.views} views</span>
                    <span>•</span>
                    <span>{movie.size}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link href={`/movies/${movie.id}`} className="flex-1">
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/90 golden-glow">
                      <Play className="w-4 h-4 mr-2" />
                      Watch Now
                    </Button>
                  </Link>
                  <Link href={`/movies/${movie.id}`}>
                    <Button size="sm" variant="outline" className="border-white/20 hover:bg-white/10 bg-transparent">
                      <Info className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
