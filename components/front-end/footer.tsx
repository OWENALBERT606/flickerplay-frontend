import { Instagram, ArrowRight, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { FooterInstallBanner } from "@/components/pwa/footer-install-banner"

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-background via-slate-950 to-black border-t border-orange-500/20 mt-20 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-purple-500/5 animate-pulse" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="relative px-4 md:px-8 lg:px-12 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Image
                            src="/logo-flickerplay.png"
                            alt="FlickerPlay"
                            width={80}
                            height={20}
                            className="h-10 w-40 object-contain"
                          />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every frame, your way. Your ultimate destination for unlimited movies, series, and entertainment. Stream in HD and enjoy ad-free content anywhere.
            </p>
            {/* App Badges */}
            <div className="flex flex-col gap-3">
              <Link
                href="/mobile"
                className="group flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-lg hover:border-orange-500/40 transition-all duration-300"
              >
                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Download on the</p>
                  <p className="text-sm font-semibold text-foreground">App Store</p>
                </div>
                <ArrowRight className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/mobile"
                className="group flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-lg hover:border-orange-500/40 transition-all duration-300"
              >
                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Get it on</p>
                  <p className="text-sm font-semibold text-foreground">Google Play</p>
                </div>
                <ArrowRight className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-300 rounded-full" />
              Explore
            </h3>
            <div className="space-y-3">
              {[
                { href: "/movies", label: "Movies" },
                { href: "/series", label: "TV Shows" },
                { href: "/trending", label: "Trending" },
                { href: "/about", label: "Our Story" },
                { href: "/help", label: "Help Center" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/privacy", label: "Privacy Policy" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-orange-500 transition-colors"
                >
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Contact / Connect */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-300 rounded-full" />
              Contact Us
            </h3>
            <div className="space-y-4">
              {/* Telegram */}
              <a
                href="https://t.me/flickerplay"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 text-sm text-muted-foreground hover:text-orange-500 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#2CA5E0]/20 group-hover:border-[#2CA5E0] transition-colors">
                  <svg className="w-5 h-5 text-orange-500 group-hover:text-[#2CA5E0] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground/60 mb-1">Telegram</p>
                  <p className="font-medium">@flickerplay</p>
                </div>
              </a>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-300 rounded-full" />
              Follow Us
            </h3>
            <div className="flex flex-col gap-3">
              {/* Instagram */}
              <a
                href="https://instagram.com/flickerplay"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl hover:border-pink-500/50 transition-all duration-300"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0">
                  <Instagram className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Follow us on</p>
                  <p className="text-sm font-semibold text-foreground">Instagram</p>
                </div>
                <ArrowRight className="w-4 h-4 text-pink-500 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        {/* ── Get the App — full width section above bottom bar ── */}
        <FooterInstallBanner />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-orange-500/20">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <p>© 2026 FlickerPlay. All rights reserved.</p>
            <Link href="/privacy" className="hover:text-orange-500 transition-colors underline decoration-orange-500/30 underline-offset-4">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-orange-500 transition-colors underline decoration-orange-500/30 underline-offset-4">Terms of Service</Link>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Crafted with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
            <span>by</span>
            <span className="font-bold bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent">
              Owen
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}