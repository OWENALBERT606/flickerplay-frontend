import Link from "next/link"
import Image from "next/image"
import { ForgotPasswordForm } from "@/components/front-end/forms/forgot-password-form"
import { RegisterHeroCarousel } from "@/components/front-end/register-hero"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Forgot Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          
  <div className="mb-4 flex flex-col w-full justify-center text-center items-center">
              <Image src="/logo-flickerplay.png" alt="FlickerPlay" width={160} height={40} className="h-14 w-56 object-contain mb-4"/>
       <h2 className="text-3xl font-bold text-foreground mb-2">Reset Password</h2>
            <p className="text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password
            </p>
      </div>
          {/* Forgot Password Form */}
          <ForgotPasswordForm />

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Back to login
            </Link>
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
