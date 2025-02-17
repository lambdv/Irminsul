"use client"
import { useRouter } from 'next/navigation'
import { handleLogin } from './handlelogin'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import loginStyle from './login.module.css'

export default function Page(props: {message?: string}) {
  const session = useSession()

  if (session.status === "authenticated")
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
        
        <h1 className='text-2xl font-bold'>Login</h1>
          <div>
            <form action={handleLogin} className="flex flex-col gap-2">
              <p>irminsul accounts use discord&apos;s oauth2 for authentication.</p>
              <p className='font-light text-gray-500' style={{fontSize: '12px', marginTop: '-5px'}}>learn more: <a href="https://discord.com/developers/docs/topics/oauth2" className="text-blue-500" target="_blank" rel="noopener noreferrer">https://discord.com/developers/docs/topics/oauth2</a></p>
              <button type="submit" className={loginStyle.loginButton}>
                <Image 
                  src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0a6ca814282eca7172c6_icon_clyde_white_RGB.svg" 
                  alt="Discord Icon" 
                  width={20}
                  height={20}
                  className="select-none"
                  unoptimized
                />
                <p>Sign in with Discord</p>
              </button>
            </form>
          </div>
      </div>
    </div>
  )
}