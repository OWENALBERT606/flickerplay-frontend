
// // "use client"

// // import type React from "react"

// // import { useState } from "react"
// // import { useRouter } from "next/navigation"
// // import Link from "next/link"
// // import { Button } from "@/components/ui/button"
// // import { Input } from "@/components/ui/input"
// // import { Label } from "@/components/ui/label"
// // import { Checkbox } from "@/components/ui/checkbox"
// // import { Eye, EyeOff, Mail, Lock, User, Loader2, Phone } from "lucide-react"
// // import { createUser } from "@/actions/auth"
// // import { toast } from "sonner"

// // export function RegisterForm() {
// //   const router = useRouter()
// //   const [showPassword, setShowPassword] = useState(false)
// //   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
// //   const [isLoading, setIsLoading] = useState(false)
// //   const [formData, setFormData] = useState({
// //     name: "",
// //     email: "",
// //     phone: "",
// //     password: "",
// //     confirmPassword: "",
// //     agreeToTerms: false,
// //   })

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault()
    
// //     // Validation
// //     if (!formData.agreeToTerms) {
// //       toast.error("Please agree to the Terms of Service and Privacy Policy.")
// //       return
// //     }

// //     if (formData.password !== formData.confirmPassword) {
// //       toast.error("Passwords do not match. Please try again.")
// //       return
// //     }

// //     if (formData.password.length < 6) {
// //       toast.error("Password must be at least 6 characters long.")
// //       return
// //     }

// //     setIsLoading(true)

// //     try {
// //       // Split the full name into firstName and lastName
// //       const nameParts = formData.name.trim().split(" ")
// //       const firstName = nameParts[0] || ""
// //       const lastName = nameParts.slice(1).join(" ") || ""

// //       const userData = {
// //         firstName,
// //         lastName,
// //         email: formData.email,
// //         phone: formData.phone,
// //         password: formData.password,
// //       }

// //       const result = await createUser(userData)

// //       if (result.success || result.data) {
// //         toast.success("Registration Successful!", {
// //           description: "Your account has been created. Redirecting to login..."
// //         })

// //         // Redirect to login page after a short delay
// //         setTimeout(() => {
// //           router.push("/login")
// //         }, 1500)
// //       }
// //     } catch (error: any) {
// //       console.error("Registration error:", error)
// //       toast.error("Failed to create account", {
// //         description: error.message || "Please try again."
// //       })
// //     } finally {
// //       setIsLoading(false)
// //     }
// //   }

// //   return (
// //     <div className="w-full max-w-md">
// //       {/* Welcome Text */}
// //       <div className="mb-4 justify-center text-center items-center">
// //         <h2 className="text-3xl font-bold text-foreground mb-2">Create Account</h2>
// //         <p className="text-muted-foreground">Join Movie-Champ256 and start streaming today</p>
// //       </div>

// //       {/* Form */}
// //       <form onSubmit={handleSubmit} className="space-y-6">
// //         {/* Name Field */}
// //         <div className="space-y-2">
// //           <Label htmlFor="name" className="text-foreground">
// //             Full Name
// //           </Label>
// //           <div className="relative">
// //             <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
// //             <Input
// //               id="name"
// //               type="text"
// //               placeholder="Enter your full name"
// //               value={formData.name}
// //               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
// //               className="pl-10"
// //               required
// //               disabled={isLoading}
// //             />
// //           </div>
// //         </div>

// //         {/* Email Field */}
// //         <div className="space-y-2">
// //           <Label htmlFor="email" className="text-foreground">
// //             Email Address
// //           </Label>
// //           <div className="relative">
// //             <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
// //             <Input
// //               id="email"
// //               type="email"
// //               placeholder="Enter your email"
// //               value={formData.email}
// //               onChange={(e) => setFormData({ ...formData, email: e.target.value })}
// //               className="pl-10"
// //               required
// //               disabled={isLoading}
// //             />
// //           </div>
// //         </div>

// //         {/* Phone Field */}
// //         <div className="space-y-2">
// //           <Label htmlFor="phone" className="text-foreground">
// //             Phone Number
// //           </Label>
// //           <div className="relative">
// //             <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
// //             <Input
// //               id="phone"
// //               type="tel"
// //               placeholder="Enter your phone number"
// //               value={formData.phone}
// //               onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
// //               className="pl-10"
// //               required
// //               disabled={isLoading}
// //             />
// //           </div>
// //         </div>

// //         {/* Password Field */}
// //         <div className="space-y-2">
// //           <Label htmlFor="password" className="text-foreground">
// //             Password
// //           </Label>
// //           <div className="relative">
// //             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
// //             <Input
// //               id="password"
// //               type={showPassword ? "text" : "password"}
// //               placeholder="Create a password"
// //               value={formData.password}
// //               onChange={(e) => setFormData({ ...formData, password: e.target.value })}
// //               className="pl-10 pr-10"
// //               required
// //               disabled={isLoading}
// //               minLength={6}
// //             />
// //             <button
// //               type="button"
// //               onClick={() => setShowPassword(!showPassword)}
// //               className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
// //               disabled={isLoading}
// //             >
// //               {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
// //             </button>
// //           </div>
// //           <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
// //         </div>

// //         {/* Confirm Password Field */}
// //         <div className="space-y-2">
// //           <Label htmlFor="confirmPassword" className="text-foreground">
// //             Confirm Password
// //           </Label>
// //           <div className="relative">
// //             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
// //             <Input
// //               id="confirmPassword"
// //               type={showConfirmPassword ? "text" : "password"}
// //               placeholder="Confirm your password"
// //               value={formData.confirmPassword}
// //               onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
// //               className="pl-10 pr-10"
// //               required
// //               disabled={isLoading}
// //             />
// //             <button
// //               type="button"
// //               onClick={() => setShowConfirmPassword(!showConfirmPassword)}
// //               className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
// //               disabled={isLoading}
// //             >
// //               {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
// //             </button>
// //           </div>
// //         </div>

// //         {/* Terms and Conditions */}
// //         <div className="flex items-start gap-3">
// //           <Checkbox
// //             id="terms"
// //             checked={formData.agreeToTerms}
// //             onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
// //             className="mt-1"
// //             disabled={isLoading}
// //           />
// //           <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
// //             I agree to the{" "}
// //             <Link href="/terms" className="text-primary hover:underline">
// //               Terms of Service
// //             </Link>{" "}
// //             and{" "}
// //             <Link href="/privacy" className="text-primary hover:underline">
// //               Privacy Policy
// //             </Link>
// //           </Label>
// //         </div>

// //         {/* Submit Button */}
// //         <Button type="submit" className="w-full" size="lg" disabled={isLoading || !formData.agreeToTerms}>
// //           {isLoading ? (
// //             <>
// //               <Loader2 className="w-4 h-4 mr-2 animate-spin" />
// //               Creating Account...
// //             </>
// //           ) : (
// //             "Create Account"
// //           )}
// //         </Button>
// //       </form>

// //       {/* Login Link */}
// //       <p className="mt-6 text-center text-muted-foreground">
// //         Already have an account?{" "}
// //         <Link href="/login" className="text-primary hover:underline font-semibold">
// //           Sign in
// //         </Link>
// //       </p>
// //     </div>
// //   )
// // }






// "use client"

// import type React from "react"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Eye, EyeOff, Mail, Lock, User, Loader2, Phone } from "lucide-react"
// import { createUser } from "@/actions/auth"
// import { toast } from "sonner"

// export function RegisterForm() {
//   const router = useRouter()
//   const [showPassword, setShowPassword] = useState(false)
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     password: "",
//     confirmPassword: "",
//     agreeToTerms: false,
//   })

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
    
//     // Validation
//     if (!formData.agreeToTerms) {
//       toast.error("Terms and Conditions Required", {
//         description: "Please agree to the Terms of Service and Privacy Policy."
//       })
//       return
//     }

//     if (formData.password !== formData.confirmPassword) {
//       toast.error("Passwords Don't Match", {
//         description: "Please make sure your passwords match."
//       })
//       return
//     }

//     if (formData.password.length < 6) {
//       toast.error("Password Too Short", {
//         description: "Password must be at least 6 characters long."
//       })
//       return
//     }

//     // Validate name (at least first and last name)
//     const nameParts = formData.name.trim().split(" ")
//     if (nameParts.length < 2 || !nameParts[0] || !nameParts[1]) {
//       toast.error("Invalid Name", {
//         description: "Please enter your full name (first and last name)."
//       })
//       return
//     }

//     setIsLoading(true)

//     try {
//       // Split the full name into firstName and lastName
//       const firstName = nameParts[0]
//       const lastName = nameParts.slice(1).join(" ")

//       const userData = {
//         firstName,
//         lastName,
//         email: formData.email,
//         phone: formData.phone,
//         password: formData.password,
//       }

//       const result = await createUser(userData)

//       if (result.success || result.data) {
//         toast.success("Registration Successful!", {
//           description: "Your account has been created. Redirecting to login..."
//         })

//         // Redirect to login page after a short delay
//         setTimeout(() => {
//           router.push("/login")
//         }, 1500)
//       } else {
//         // Show specific error from backend
//         toast.error("Registration Failed", {
//           description: result.error || "Unable to create account. Please try again."
//         })
//       }
//     } catch (error: any) {
//       console.error("Registration error:", error)
      
//       // Show detailed error toast
//       toast.error("Registration Failed", {
//         description: error.message || "An unexpected error occurred. Please try again."
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="w-full max-w-md">
//       {/* Welcome Text */}
//       <div className="mb-4 justify-center text-center items-center">
//         <h2 className="text-3xl font-bold text-foreground mb-2">Create Account</h2>
//         <p className="text-muted-foreground">Join Flickerplay and start streaming today</p>
//       </div>

//       {/* Form */}
//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Name Field */}
//         <div className="space-y-2">
//           <Label htmlFor="name" className="text-foreground">
//             Full Name
//           </Label>
//           <div className="relative">
//             <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//             <Input
//               id="name"
//               type="text"
//               placeholder="Enter your full name"
//               value={formData.name}
//               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//               className="pl-10"
//               required
//               disabled={isLoading}
//             />
//           </div>
//           <p className="text-xs text-muted-foreground">Please enter first and last name</p>
//         </div>

//         {/* Email Field */}
//         <div className="space-y-2">
//           <Label htmlFor="email" className="text-foreground">
//             Email Address
//           </Label>
//           <div className="relative">
//             <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//             <Input
//               id="email"
//               type="email"
//               placeholder="Enter your email"
//               value={formData.email}
//               onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//               className="pl-10"
//               required
//               disabled={isLoading}
//             />
//           </div>
//         </div>

//         {/* Phone Field */}
//         <div className="space-y-2">
//           <Label htmlFor="phone" className="text-foreground">
//             Phone Number
//           </Label>
//           <div className="relative">
//             <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//             <Input
//               id="phone"
//               type="tel"
//               placeholder="0700000000 or +256700000000"
//               value={formData.phone}
//               onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//               className="pl-10"
//               required
//               disabled={isLoading}
//             />
//           </div>
//         </div>

//         {/* Password Field */}
//         <div className="space-y-2">
//           <Label htmlFor="password" className="text-foreground">
//             Password
//           </Label>
//           <div className="relative">
//             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//             <Input
//               id="password"
//               type={showPassword ? "text" : "password"}
//               placeholder="Create a password"
//               value={formData.password}
//               onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//               className="pl-10 pr-10"
//               required
//               disabled={isLoading}
//               minLength={6}
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
//               disabled={isLoading}
//             >
//               {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//             </button>
//           </div>
//           <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
//         </div>

//         {/* Confirm Password Field */}
//         <div className="space-y-2">
//           <Label htmlFor="confirmPassword" className="text-foreground">
//             Confirm Password
//           </Label>
//           <div className="relative">
//             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//             <Input
//               id="confirmPassword"
//               type={showConfirmPassword ? "text" : "password"}
//               placeholder="Confirm your password"
//               value={formData.confirmPassword}
//               onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
//               className="pl-10 pr-10"
//               required
//               disabled={isLoading}
//             />
//             <button
//               type="button"
//               onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//               className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
//               disabled={isLoading}
//             >
//               {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//             </button>
//           </div>
//         </div>

//         {/* Terms and Conditions */}
//         <div className="flex items-start gap-3">
//           <Checkbox
//             id="terms"
//             checked={formData.agreeToTerms}
//             onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
//             className="mt-1"
//             disabled={isLoading}
//           />
//           <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
//             I agree to the{" "}
//             <Link href="/terms" className="text-primary hover:underline">
//               Terms of Service
//             </Link>{" "}
//             and{" "}
//             <Link href="/privacy" className="text-primary hover:underline">
//               Privacy Policy
//             </Link>
//           </Label>
//         </div>

//         {/* Submit Button */}
//         <Button type="submit" className="w-full" size="lg" disabled={isLoading || !formData.agreeToTerms}>
//           {isLoading ? (
//             <>
//               <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//               Creating Account...
//             </>
//           ) : (
//             "Create Account"
//           )}
//         </Button>
//       </form>

//       {/* Login Link */}
//       <p className="mt-6 text-center text-muted-foreground">
//         Already have an account?{" "}
//         <Link href="/login" className="text-primary hover:underline font-semibold">
//           Sign in
//         </Link>
//       </p>
//     </div>
//   )
// }





"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, User, Loader2, Phone } from "lucide-react"
import { createUser } from "@/actions/auth"
import { toast } from "sonner"
import Image from "next/image"

export function RegisterForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.agreeToTerms) {
      toast.error("Terms and Conditions Required", {
        description: "Please agree to the Terms of Service and Privacy Policy."
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords Don't Match", {
        description: "Please make sure your passwords match."
      })
      return
    }

    if (formData.password.length < 6) {
      toast.error("Password Too Short", {
        description: "Password must be at least 6 characters long."
      })
      return
    }

    // Validate name (at least first and last name)
    const nameParts = formData.name.trim().split(" ")
    if (nameParts.length < 2 || !nameParts[0] || !nameParts[1]) {
      toast.error("Invalid Name", {
        description: "Please enter your full name (first and last name)."
      })
      return
    }

    setIsLoading(true)

    try {
      // Split the full name into firstName and lastName
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(" ")

      const userData = {
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      }

      const result = await createUser(userData)

      if (result.success && result.data) {
        toast.success("Registration Successful!", {
          description: "Your account has been created. Redirecting to login..."
        })

        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push("/login")
        }, 1500)
      } else {
        // Show specific error from backend
        toast.error("Registration Failed", {
          description: result.error || "Unable to create account. Please try again."
        })
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      
      // Show detailed error toast
      toast.error("Registration Failed", {
        description: error.message || "An unexpected error occurred. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Welcome Text */}
      <div className="mb-4 flex flex-col justify-center text-center items-center">
        <Image src="/logo/unnamed (3).jpg" alt="FlickerPlay" width={160} height={40} className="h-10 w-40 object-contain mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-2">Create Account</h2>
        <p className="text-muted-foreground">Join FlickerPlay and start streaming today</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">
            Full Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="pl-10"
              required
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-muted-foreground">Please enter first and last name</p>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="pl-10"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-foreground">
            Phone Number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="0700000000 or +256700000000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="pl-10"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="pl-10 pr-10"
              required
              disabled={isLoading}
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-foreground">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="pl-10 pr-10"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
            className="mt-1"
            disabled={isLoading}
          />
          <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
            I agree to the{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </Label>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" size="lg" disabled={isLoading || !formData.agreeToTerms}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      {/* Login Link */}
      <p className="mt-6 text-center text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  )
}
