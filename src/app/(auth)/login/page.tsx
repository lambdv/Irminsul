"use client"
import { useRouter } from 'next/navigation'
import { handleLogin } from './handlelogin'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function Page() {
  const session = useSession()

  if (session.status === "authenticated")
    redirect("/")
  
  return (
    <div className='flex flex-col gap-2' style={{
      width: "50%",
      margin: "auto",
      marginTop: "30vh",
      transform: "translateY(-50%)",
      padding: "20px", 
      border: "1px solid #ccc",
      borderRadius: "10px",
    }}>
      <h1 className='text-2xl font-bold'>Login</h1>
        <div>
          <form action={handleLogin} className="flex flex-col gap-2">
            <p>we use discord&apos;s oauth2 for authentication.</p>
            <p>learn more: <a href="https://discord.com/developers/docs/topics/oauth2" className="text-blue-500" target="_blank" rel="noopener noreferrer">https://discord.com/developers/docs/topics/oauth2</a></p>
            <button type="submit" className='bg-blue-500 text-white p-2 rounded-md flex flex-row gap-2 justify-center items-center'>
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
  )
}