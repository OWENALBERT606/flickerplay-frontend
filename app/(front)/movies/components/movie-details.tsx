

// "use client";

// import { Star, Share2, Download, Eye, HardDrive, Clock, Calendar } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import type { Movie } from "@/actions/movies";
// import { AddToListButton } from "./add-to-list-button";

// interface MovieDetailsProps {
//   movie: Movie;
//   userId?: string; // Add userId prop
// }

// export function MovieDetails({ movie, userId }: MovieDetailsProps) {
//   const viewsCount = Number(movie.viewsCount || 0);

//   return (
//     <div className="space-y-6">
//       {/* Title and Meta */}
//       <div>
//         <h1 className="text-4xl md:text-5xl font-bold mb-3">{movie.title}</h1>
//         <div className="flex flex-wrap items-center gap-3 text-sm">
//           <div className="flex items-center gap-1">
//             <Star className="w-5 h-5 fill-orange-500 text-orange-500" />
//             <span className="font-bold text-white">{movie.rating.toFixed(1)}</span>
//           </div>
//           <span className="text-gray-400">•</span>
//           <span className="text-gray-300">{movie.year.value}</span>
//           <span className="text-gray-400">•</span>
//           <span className="text-gray-300">{movie.length || "N/A"}</span>
//           <span className="text-gray-400">•</span>
//           <Badge variant="outline" className="border-orange-500/30 text-orange-500">
//             {movie.genre.name}
//           </Badge>
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="flex flex-wrap items-center gap-3">
//         {/* ✅ Replace with AddToListButton */}
//         <AddToListButton
//           itemId={movie.id}
//           type="movie"
//           userId={userId}
//           className="bg-orange-500 hover:bg-orange-600 text-white"
//         />
        
//         <Button variant="outline" className="border-gray-700 bg-gray-900/50 hover:bg-gray-800">
//           <Share2 className="w-5 h-5 mr-2" />
//           Share
//         </Button>
//         <Button variant="outline" className="border-gray-700 bg-gray-900/50 hover:bg-gray-800">
//           <Download className="w-5 h-5 mr-2" />
//           Download
//         </Button>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
//           <div className="flex items-center gap-2 text-gray-400 mb-2">
//             <Eye className="w-4 h-4" />
//             <span className="text-sm">Views</span>
//           </div>
//           <p className="text-2xl font-bold text-white">
//             {viewsCount >= 1000000
//               ? `${(viewsCount / 1000000).toFixed(1)}M`
//               : viewsCount >= 1000
//               ? `${(viewsCount / 1000).toFixed(1)}K`
//               : viewsCount}
//           </p>
//         </div>

//         <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
//           <div className="flex items-center gap-2 text-gray-400 mb-2">
//             <HardDrive className="w-4 h-4" />
//             <span className="text-sm">File Size</span>
//           </div>
//           <p className="text-2xl font-bold text-white">{movie.size || "N/A"}</p>
//         </div>

//         <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
//           <div className="flex items-center gap-2 text-gray-400 mb-2">
//             <Clock className="w-4 h-4" />
//             <span className="text-sm">Duration</span>
//           </div>
//           <p className="text-2xl font-bold text-white">{movie.length || "N/A"}</p>
//         </div>

//         <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
//           <div className="flex items-center gap-2 text-gray-400 mb-2">
//             <Calendar className="w-4 h-4" />
//             <span className="text-sm">Release Year</span>
//           </div>
//           <p className="text-2xl font-bold text-white">{movie.year.value}</p>
//         </div>
//       </div>

//       {/* Synopsis */}
//       <div>
//         <h2 className="text-2xl font-bold mb-3">Synopsis</h2>
//         <p className="text-gray-300 leading-relaxed">
//           {movie.description || "No description available."}
//         </p>
//       </div>
//     </div>
//   );
// }



"use client";

import { Star, Share2, Download, Eye, HardDrive, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Movie } from "@/actions/movies";
import { AddToListButton } from "./add-to-list-button";
import { CommentSection } from "@/components/front-end/comment-section";

interface MovieDetailsProps {
  movie: Movie;
  userId?: string;
  userName?: string;
  userImage?: string;
}

export function MovieDetails({ movie, userId, userName, userImage }: MovieDetailsProps) {
  const viewsCount = Number(movie.viewsCount || 0);

  const handleDownload = () => {
    const url = movie.videoUrl;
    if (!url) {
      toast.error("Download link not available");
      return;
    }
    const ext = url.split("?")[0].split(".").pop() || "mp4";
    const filename = `${movie.title}.${ext}`;
    window.location.href = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
    toast.success("Download starting…", { description: movie.title });
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/movies/${movie.slug}`;
    
    if (navigator.share) {
      // Use native share if available (mobile)
      try {
        await navigator.share({
          title: movie.title,
          text: `Check out ${movie.title} on Flickerplay`,
          url: shareUrl,
        });
        toast.success("Shared successfully");
      } catch (error) {
        // User cancelled share
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard", {
          description: "Share this link with your friends",
        });
      } catch (error) {
        toast.error("Failed to copy link");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Title and Meta */}
      <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">{movie.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-orange-500 text-orange-500" />
            <span className="font-bold text-white">{movie.rating.toFixed(1)}</span>
          </div>
          <span className="text-gray-400">•</span>
          <span className="text-gray-300">{movie.year.value}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-300">{movie.length || "N/A"}</span>
          <span className="text-gray-400">•</span>
          <Badge variant="outline" className="border-orange-500/30 text-orange-500">
            {movie.genre.name}
          </Badge>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Add to List Button */}
        <AddToListButton
          itemId={movie.id}
          type="movie"
          userId={userId}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        />
        
        {/* Share Button */}
        <Button 
          variant="outline" 
          className="border-gray-700 bg-gray-900/50 hover:bg-gray-800"
          onClick={handleShare}
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share
        </Button>

        {/* Download Button */}
        <Button 
          variant="outline" 
          className="border-gray-700 bg-gray-900/50 hover:bg-gray-800"
          onClick={handleDownload}
        >
          <Download className="w-5 h-5 mr-2" />
          Download
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Eye className="w-4 h-4" />
            <span className="text-sm">Views</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {viewsCount >= 1000000
              ? `${(viewsCount / 1000000).toFixed(1)}M`
              : viewsCount >= 1000
              ? `${(viewsCount / 1000).toFixed(1)}K`
              : viewsCount}
          </p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <HardDrive className="w-4 h-4" />
            <span className="text-sm">File Size</span>
          </div>
          <p className="text-2xl font-bold text-white">{movie.size || "N/A"}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Duration</span>
          </div>
          <p className="text-2xl font-bold text-white">{movie.length || "N/A"}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Release Year</span>
          </div>
          <p className="text-2xl font-bold text-white">{movie.year.value}</p>
        </div>
      </div>

      {/* Synopsis */}
      <div>
        <h2 className="text-2xl font-bold mb-3">Synopsis</h2>
        <p className="text-gray-300 leading-relaxed">
          {movie.description || "No description available."}
        </p>
      </div>

      {/* Additional Info */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Director */}
        {movie.director && (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-400">Director</h3>
            <p className="text-white">{movie.director}</p>
          </div>
        )}

        {/* Cast */}
        {movie.cast && movie.cast.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-400">Cast</h3>
            <p className="text-white">{movie.cast.join(", ")}</p>
          </div>
        )}

        {/* VJ */}
        {movie.vj && (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-400">VJ</h3>
            <p className="text-white">{movie.vj.name}</p>
          </div>
        )}
      </div>

      {/* Comment Section */}
      <CommentSection 
        itemId={movie.id} 
        type="movie" 
        userId={userId} 
        userName={userName}
        userImage={userImage}
      />
    </div>
  );
}