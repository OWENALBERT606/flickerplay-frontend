import { LoginForm } from "@/components/front-end/forms/login-form"
import Link from "next/link"
import Image from "next/image"
import { RegisterHeroCarousel } from "@/components/front-end/register-hero"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
         <div className="mb-4 flex flex-col w-full justify-center text-center items-center">
              <Image src="/logo/unnamed (3).jpg" alt="FlickerPlay" width={160} height={40} className="h-10 w-40 object-contain mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to continue your cinematic journey</p>
      </div>

          {/* Login Form */}
          <LoginForm />

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline font-semibold">
                Sign up
              </Link>
            </p>
          </div>
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Back to Home{" "}
              <Link href="/" className="text-primary hover:underline font-semibold">
                Home
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
       <RegisterHeroCarousel/>
      </div>
    </div>
  )
}
