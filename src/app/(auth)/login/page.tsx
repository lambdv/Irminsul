"use client"
import { useRouter } from 'next/navigation'
import { handleLogin } from './handlelogin'
import Image from 'next/image'
import { useSessionContext } from '@/lib/session-context'
import { redirect } from 'next/navigation'
import loginStyle from './login.module.css'
import { Metadata } from 'next'
import { useEffect } from 'react'

// For Next.js 15, client components can't export metadata directly
// Instead, we'll use document.title to set the page title on the client side
export default function Page(props: {message?: string}) {
  const { status } = useSessionContext()
  
  useEffect(() => {
    document.title = "Login | Irminsul"
  }, [])

  if (status === "authenticated")
    redirect("/")
  
  return (
    <div className={loginStyle.loginContainer}>
      {
        props.message && (
          <div className={loginStyle.loginMessage}>
            <p>{props.message}</p>
          </div>
        )
      }
      <div className={loginStyle.loginWrapper}>
        
        <h1 className='text-2xl font-bold mb-2'>Login</h1>
          <div>
            <form action={handleLogin} className="flex flex-col gap-2">
              <p className='font-light text-gray-500' style={{fontSize: '12px', marginTop: '-5px'}}>
                irminsul accounts use discord&apos;s oauth2 for authentication.
                <br />
                learn more: <a href="https://discord.com/developers/docs/topics/oauth2" className="text-blue-500" target="_blank" rel="noopener noreferrer">https://discord.com/developers/docs/topics/oauth2</a>
              </p>
              <button type="submit" className={loginStyle.loginButton}>
                <Image 
                  src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0a6ca814282eca7172c6_icon_clyde_white_RGB.svg" 
                  alt="Discord Icon" 
                  width={20}
                  height={20}
                  className="select-none"
                  unoptimized={false}
                />
                <p>Sign in with Discord</p>
              </button>
            </form>
          </div>
      </div>
    </div>
  )
}