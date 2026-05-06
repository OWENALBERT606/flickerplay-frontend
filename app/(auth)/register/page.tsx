import { RegisterForm } from "@/components/front-end/forms/register-form"
import { RegisterHeroCarousel } from "@/components/front-end/register-hero"
import { listMovies } from "@/actions/movies"

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  // Fetch movies for the carousel
  const moviesData = await listMovies({ limit: 10, isTrending: true }).catch(() => ({ data: [] }))
  const movies = (moviesData.data || []).filter((m) => !!(m.trailerPoster || m.poster || m.image))

  const slides = movies.map((m) => ({
    src: m.trailerPoster || m.poster || m.image,
    title: m.title,
    description: m.description || `${m.genre?.name ?? ""} · ${m.year?.value ?? ""}`.trim(),
    rating: m.rating,
    genre: m.genre?.name,
    year: m.year?.value,
  }))

  return (
    <div className="min-h-screen bg-background">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left side - Register Form */}
        <div className="flex items-center justify-center p-8">
          <RegisterForm />
        </div>

        {/* Right side - Movie Carousel */}
        <div className="hidden lg:block relative overflow-hidden">
          <RegisterHeroCarousel slides={slides} />
        </div>
      </div>
    </div>
  )
}
