import { LoginForm } from "@/components/front-end/forms/login-form"
import Link from "next/link"
import Image from "next/image"
import { RegisterHeroCarousel } from "@/components/front-end/register-hero"
import { listMovies } from "@/actions/movies"

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // Fetch movies for the carousel — use trailerPoster or poster as the slide image
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
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-4 flex flex-col w-full justify-center text-center items-center">
            <Image
              src="/logo-flickerplay.png"
              alt="FlickerPlay"
              width={160}
              height={40}
              className="h-14 w-56 object-contain mb-4"
            />
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to continue your cinematic journey</p>
          </div>

          <LoginForm />

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline font-semibold">
                Sign up
              </Link>
            </p>
          </div>
          <div className="mt-4 text-center">
            <p className="text-muted-foreground">
              Back to{" "}
              <Link href="/" className="text-primary hover:underline font-semibold">
                Home
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Movie Carousel */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <RegisterHeroCarousel slides={slides} />
      </div>
    </div>
  )
}
