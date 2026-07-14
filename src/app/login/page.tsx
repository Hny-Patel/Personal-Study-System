'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function LoginPage() {
  const supabase = createClient()

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        scopes: 'https://www.googleapis.com/auth/calendar.readonly',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Left Panel (Visual) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center relative overflow-hidden bg-gradient-to-br from-[#dce7ff] to-[#f5efff] dark:from-[#2e2b5e] dark:to-[#1a1835]">
        {/* Hero Text */}
        <div className="absolute top-16 left-0 right-0 z-10 text-center px-12">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6 leading-tight">
            Your Second Brain.<br />Organized.
          </h2>
          <p className="text-lg text-zinc-700 dark:text-zinc-300 max-w-md mx-auto">
            Sync your tasks, master your calendar, and capture every note in one beautiful workspace.
          </p>
        </div>
        
        {/* Illustration */}
        <div className="relative w-full h-[65vh] mt-32 flex items-center justify-center">
          <Image 
            src="/login-hero.png" 
            alt="Study OS Hero Illustration" 
            fill 
            className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700 ease-out" 
            priority
          />
        </div>
        
        {/* Decorative Glows */}
        <div className="absolute top-1/4 -left-12 w-96 h-96 bg-white/40 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-12 w-96 h-96 bg-pink-400/20 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Right Panel (Interactive) */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 relative">
        {/* Mobile-only background glow */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent lg:hidden dark:from-blue-900/20 pointer-events-none" />
        
        <div className="w-full max-w-md space-y-10">
          <div className="flex flex-col space-y-4 text-center items-center">
            {/* Elegant Icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20 mb-4 ring-4 ring-white dark:ring-zinc-950">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-white"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Welcome to Study OS</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Sign in to your centralized dashboard.
            </p>
          </div>

          <div className="space-y-6 pt-4">
            <Button 
              onClick={handleGoogleSignIn} 
              variant="outline"
              className="w-full h-14 text-base font-semibold transition-all hover:bg-zinc-50 hover:border-zinc-300 dark:hover:bg-zinc-900 dark:hover:border-zinc-700 hover:shadow-md relative overflow-hidden group rounded-xl border-zinc-200 dark:border-zinc-800"
            >
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black/5 dark:to-white/5 pointer-events-none"></span>
              <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>
          </div>

          <p className="text-center text-xs text-zinc-500 dark:text-zinc-500 pt-8">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
