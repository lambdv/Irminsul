"use client"
import { handleLogin } from './handlelogin'
import Image from 'next/image'
import { useSessionContext } from '@/lib/session-context'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/cn/card"
import { Button } from "@/components/cn/button"

export default function Page(props: {message?: string}) {
  const { status } = useSessionContext()
  
  useEffect(() => {
    document.title = "Login | Irminsul"
  }, [])

  if (status === "authenticated")
    redirect("/")
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-4">
        {props.message && (
          <div className="p-4 rounded-lg bg-muted border border-border text-sm text-foreground">
            <p>{props.message}</p>
          </div>
        )}
        
        <Card className="shadow-lg">
          <CardHeader className="space-y-3 text-center">
            <CardTitle className="text-3xl font-bold">Login</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form action={handleLogin} className="space-y-4">
              <Button 
                type="submit" 
                className="w-full h-12 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium text-base"
                size="lg"
              >
                <Image 
                  src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0a6ca814282eca7172c6_icon_clyde_white_RGB.svg" 
                  alt="Discord Icon" 
                  width={24}
                  height={24}
                  className="select-none"
                  unoptimized={true}
                />
                Sign in with Discord
              </Button>
            </form>
            
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                Irminsul accounts use Discord&apos;s OAuth2 for authentication.
                <br />
                <a 
                  href="https://discord.com/developers/docs/topics/oauth2" 
                  className="text-primary hover:underline" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Learn more about OAuth2
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}