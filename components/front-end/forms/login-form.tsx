// // "use client"

// // import type React from "react"

// // import { useState } from "react"
// // import { Button } from "@/components/ui/button"
// // import { Input } from "@/components/ui/input"
// // import { Label } from "@/components/ui/label"
// // import { Checkbox } from "@/components/ui/checkbox"
// // import Link from "next/link"
// // import { Eye, EyeOff, Loader2 } from "lucide-react"

// // export function LoginForm() {
// //   const [showPassword, setShowPassword] = useState(false)
// //   const [isLoading, setIsLoading] = useState(false)
// //   const [formData, setFormData] = useState({
// //     email: "",
// //     password: "",
// //     rememberMe: false,
// //   })

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault()
// //     setIsLoading(true)

// //     // Simulate API call
// //     await new Promise((resolve) => setTimeout(resolve, 1500))

// //     console.log("[v0] Login attempt:", { email: formData.email, rememberMe: formData.rememberMe })

// //     setIsLoading(false)
// //     // In a real app, handle authentication here
// //   }

// //   return (
// //     <form onSubmit={handleSubmit} className="space-y-6">
// //       {/* Email Field */}
// //       <div className="space-y-2">
// //         <Label htmlFor="email" className="text-foreground">
// //           Email
// //         </Label>
// //         <Input
// //           id="email"
// //           type="email"
// //           placeholder="you@example.com"
// //           value={formData.email}
// //           onChange={(e) => setFormData({ ...formData, email: e.target.value })}
// //           required
// //           className="bg-secondary border-border"
// //         />
// //       </div>

// //       {/* Password Field */}
// //       <div className="space-y-2">
// //         <Label htmlFor="password" className="text-foreground">
// //           Password
// //         </Label>
// //         <div className="relative">
// //           <Input
// //             id="password"
// //             type={showPassword ? "text" : "password"}
// //             placeholder="Enter your password"
// //             value={formData.password}
// //             onChange={(e) => setFormData({ ...formData, password: e.target.value })}
// //             required
// //             className="bg-secondary border-border pr-10"
// //           />
// //           <button
// //             type="button"
// //             onClick={() => setShowPassword(!showPassword)}
// //             className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
// //           >
// //             {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
// //           </button>
// //         </div>
// //       </div>

// //       {/* Remember Me & Forgot Password */}
// //       <div className="flex items-center justify-between">
// //         <div className="flex items-center space-x-2">
// //           <Checkbox
// //             id="remember"
// //             checked={formData.rememberMe}
// //             onCheckedChange={(checked:any) => setFormData({ ...formData, rememberMe: checked as boolean })}
// //           />
// //           <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
// //             Remember me
// //           </Label>
// //         </div>
// //         <Link href="/forgot-password" className="text-sm text-primary hover:underline">
// //           Forgot password?
// //         </Link>
// //       </div>

// //       {/* Submit Button */}
// //       <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
// //         {isLoading ? (
// //           <>
// //             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
// //             Signing in...
// //           </>
// //         ) : (
// //           "Sign In"
// //         )}
// //       </Button>

// //       {/* Divider */}

// //       {/* Social Login Buttons */}
// //       {/* <div className="grid grid-cols-2 gap-4">
// //         <Button type="button" variant="outline" className="w-full bg-transparent">
// //           <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
// //             <path
// //               fill="currentColor"
// //               d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
// //             />
// //             <path
// //               fill="currentColor"
// //               d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
// //             />
// //             <path
// //               fill="currentColor"
// //               d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
// //             />
// //             <path
// //               fill="currentColor"
// //               d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
// //             />
// //           </svg>
// //           Google
// //         </Button>
// //         <Button type="button" variant="outline" className="w-full bg-transparent">
// //           <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
// //             <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
// //           </svg>
// //           GitHub
// //         </Button>
// //       </div> */}
// //     </form>
// //   )
// // }


// "use client"

// import type React from "react"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Checkbox } from "@/components/ui/checkbox"
// import Link from "next/link"
// import { Eye, EyeOff, Loader2 } from "lucide-react"
// import { loginUser } from "@/actions/auth"
// import { toast } from "sonner"

// export function LoginForm() {
//   const router = useRouter()
//   const [showPassword, setShowPassword] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [formData, setFormData] = useState({
//     identifier: "",
//     password: "",
//     rememberMe: false,
//   })

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)

//     try {
//       const result = await loginUser({
//         identifier: formData.identifier,
//         password: formData.password,
//       })

//       if (result.success) {
//         // Show success toast
//         toast.success("Login successful!")
//         // Login successful - redirect to dashboard
//         if(result.data?.user?.role === "SUPER_ADMIN"){
//           router.push("/dashboard")
//           router.refresh() // Refresh to update server components with new session
//         }else{
//           router.push("/")
//           router.refresh() // Refresh to update server components with new session  
//         }
//       } else {
//         // Show error toast
//         toast.error("Invalid credentials. Please try again.")
//       }
//     } catch (err) {
//       console.error("Login error:", err)
//       toast("An unexpected error occurred. Please try again later.")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       {/* Email/Phone Field */}
//       <div className="space-y-2">
//         <Label htmlFor="identifier" className="text-foreground">
//           Email or Phone
//         </Label>
//         <Input
//           id="identifier"
//           type="text"
//           placeholder="you@example.com or phone number"
//           value={formData.identifier}
//           onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
//           required
//           disabled={isLoading}
//           className="bg-secondary border-border"
//         />
//       </div>

//       {/* Password Field */}
//       <div className="space-y-2">
//         <Label htmlFor="password" className="text-foreground">
//           Password
//         </Label>
//         <div className="relative">
//           <Input
//             id="password"
//             type={showPassword ? "text" : "password"}
//             placeholder="Enter your password"
//             value={formData.password}
//             onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//             required
//             disabled={isLoading}
//             className="bg-secondary border-border pr-10"
//           />
//           <button
//             type="button"
//             onClick={() => setShowPassword(!showPassword)}
//             className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
//             disabled={isLoading}
//           >
//             {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//           </button>
//         </div>
//       </div>

//       {/* Remember Me & Forgot Password */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-2">
//           <Checkbox
//             id="remember"
//             checked={formData.rememberMe}
//             onCheckedChange={(checked: any) => 
//               setFormData({ ...formData, rememberMe: checked as boolean })
//             }
//             disabled={isLoading}
//           />
//           <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
//             Remember me
//           </Label>
//         </div>
//         <Link href="/forgot-password" className="text-sm text-primary hover:underline">
//           Forgot password?
//         </Link>
//       </div>

//       {/* Submit Button */}
//       <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
//         {isLoading ? (
//           <>
//             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//             Signing in...
//           </>
//         ) : (
//           "Sign In"
//         )}
//       </Button>

//       {/* Divider */}
//       {/* Uncomment if you want social login
//       <div className="relative">
//         <div className="absolute inset-0 flex items-center">
//           <span className="w-full border-t" />
//         </div>
//         <div className="relative flex justify-center text-xs uppercase">
//           <span className="bg-background px-2 text-muted-foreground">
//             Or continue with
//           </span>
//         </div>
//       </div>
//       */}

//       {/* Social Login Buttons */}
//       {/* <div className="grid grid-cols-2 gap-4">
//         <Button type="button" variant="outline" className="w-full bg-transparent" disabled={isLoading}>
//           <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
//             <path
//               fill="currentColor"
//               d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//             />
//             <path
//               fill="currentColor"
//               d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//             />
//             <path
//               fill="currentColor"
//               d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//             />
//             <path
//               fill="currentColor"
//               d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//             />
//           </svg>
//           Google
//         </Button>
//         <Button type="button" variant="outline" className="w-full bg-transparent" disabled={isLoading}>
//           <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
//             <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
//           </svg>
//           GitHub
//         </Button>
//       </div> */}
//     </form>
//   )
// }





"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { loginUser, googleSignIn } from "@/actions/auth"
import { toast } from "sonner"

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  })

  const handleGoogleSignIn = useCallback(async () => {
    setIsGoogleLoading(true)
    try {
      const result = await googleSignIn()
      
      if (result.success) {
        toast.success("Google sign-in successful!", {
          description: "Welcome to Flickerplay"
        })
        
        if (result.data?.user?.role === "SUPER_ADMIN" || 
            result.data?.user?.role === "ADMIN" || 
            result.data?.user?.role === "MANAGER") {
          router.push("/dashboard")
        } else {
          router.push("/")
        }
        router.refresh()
      } else {
        toast.error(result.error || "Google sign-in failed", {
          description: "Please try again."
        })
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err)
      toast.error("Google sign-in failed", {
        description: err.message || "An unexpected error occurred."
      })
    } finally {
      setIsGoogleLoading(false)
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await loginUser({
        identifier: formData.identifier,
        password: formData.password,
      })

      if (result.success) {
        // Show success toast
        toast.success("Login successful!", {
          description: "Welcome back to Flickerplay"
        })
        
        // Login successful - redirect based on role
        if (result.data?.user?.role === "SUPER_ADMIN" || 
            result.data?.user?.role === "ADMIN" || 
            result.data?.user?.role === "MANAGER") {
          router.push("/dashboard")
          router.refresh()
        } else {
          router.push("/")
          router.refresh()
        }
      } else {
        // Show specific error from backend
        toast.error(result.error || "Login failed", {
          description: "Please check your credentials and try again."
        })
      }
    } catch (err: any) {
      console.error("Login error:", err)
      
      // Show error toast with details if available
      toast.error("Login failed", {
        description: err.message || "An unexpected error occurred. Please try again later."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email/Phone Field */}
      <div className="space-y-2">
        <Label htmlFor="identifier" className="text-foreground">
          Email or Phone
        </Label>
        <Input
          id="identifier"
          type="text"
          placeholder="you@example.com or phone number"
          value={formData.identifier}
          onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
          required
          disabled={isLoading}
          className="bg-secondary border-border"
        />
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            disabled={isLoading}
            className="bg-secondary border-border pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={formData.rememberMe}
            onCheckedChange={(checked: any) => 
              setFormData({ ...formData, rememberMe: checked as boolean })
            }
            disabled={isLoading}
          />
          <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
            Remember me
          </Label>
        </div>
        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      {/* Google Sign-In Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full bg-transparent"
        disabled={isGoogleLoading}
        onClick={handleGoogleSignIn}
      >
        {isGoogleLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        Google
      </Button>
    </form>
  )
}
