"use client"

import { use } from "react"
import { Button } from "@/components/ui/button"
import { Play, Plus, Share2, Star } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import Link from "next/link"
import { documentariesData } from "@/lib/documentary-data"
import { TrailerPlayer } from "@/components/front-end/trailer-player"

export default async function DocumentaryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const documentary = documentariesData.find((d) => d.id === Number.parseInt(id))
  const [isPlaying, setIsPlaying] = useState(false)

  if (!documentary) {
    return <div>Documentary not found</div>
  }

  const relatedDocs = documentariesData
    .filter((d) => d.genre === documentary.genre && d.id !== documentary.id)
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-background">

      <main className="pt-20">
        {/* Video Player Section */}
        <div className="relative w-full aspect-video bg-black">
          {!isPlaying ? (
            <div className="relative w-full h-full">
              <Image
                src={documentary.poster || "/placeholder.svg"}
                alt={documentary.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-20 h-20"
                  onClick={() => setIsPlaying(true)}
                >
                  <Play className="w-8 h-8 ml-1" fill="currentColor" />
                </Button>
              </div>
            </div>
          ) : (
            <video src={documentary.videoUrl} poster={documentary.poster} controls autoPlay className="w-full h-full" />
          )}
        </div>

        {/* Documentary Info */}
        <div className="px-4 md:px-8 lg:px-12 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="md:col-span-2">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{documentary.title}</h1>

                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary fill-primary" />
                    <span className="text-lg font-semibold text-foreground">{documentary.rating}</span>
                  </div>
                  <span className="text-muted-foreground">{documentary.year}</span>
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">{documentary.genre}</span>
                  <span className="text-muted-foreground">{documentary.length}</span>
                  <span className="text-muted-foreground">{documentary.views} views</span>
                </div>

                {documentary.vj && (
                  <div className="mb-6">
                    <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm">
                      Translated by {documentary.vj}
                    </span>
                  </div>
                )}

                <div className="flex gap-3 mb-8">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => setIsPlaying(true)}
                  >
                    <Play className="w-5 h-5 mr-2" fill="currentColor" />
                    Watch Now
                  </Button>
                  <Button size="lg" variant="outline">
                    <Plus className="w-5 h-5 mr-2" />
                    My List
                  </Button>
                  <Button size="lg" variant="outline">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-3">Description</h2>
                  <p className="text-muted-foreground leading-relaxed">{documentary.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Director</h3>
                    <p className="text-foreground">{documentary.director}</p>
                  </div>
                  {documentary.narrator && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">Narrator</h3>
                      <p className="text-foreground">{documentary.narrator}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div>
                <div className="sticky top-24">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Trailer</h2>
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
                    {documentary.trailerUrl ? (
                      <TrailerPlayer
                        url={documentary.trailerUrl}
                        title={`${documentary.title} Trailer`}
                        poster={documentary.trailerPoster}
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg">
                        <p className="text-muted-foreground text-sm">No trailer available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Related Documentaries */}
            {relatedDocs.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-semibold text-foreground mb-6">More Like This</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {relatedDocs.map((doc) => (
                    <Link key={doc.id} href={`/documentaries/${doc.id}`} className="group">
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-secondary">
                        <Image
                          src={doc.image || "/placeholder.svg"}
                          alt={doc.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <h3 className="mt-2 font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {doc.title}
                      </h3>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
