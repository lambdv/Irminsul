import React from 'react'
import { signIn } from '@/app/auth'

export default function Page() {
  return (
    <div className='flex flex-col gap-2'>
      <div className='flex flex-col gap-2' style={{
        width: "50%",
        margin: "auto",
        marginTop: "30vh",
        transform: "translateY(-50%)",
        padding: "20px", 
        border: "1px solid #ccc",
        borderRadius: "10px",
      }}>
        <h1 className='text-2xl font-bold'>Sign Up</h1>
        <div className=''>
              <form action={async (credentials) => {
                "use server"
                try{
                  await signIn("credentials", credentials)
                }catch(e){
                  console.log(e)
                }

              }}
                className='flex flex-col gap-2'
              >
                <label htmlFor="username">
                  Username
                  <input type="text" name="username" placeholder="Username" className="border border-gray-300 rounded-md p-2 text-black" />
                </label>
                <label htmlFor="email">
                  Email
                  <input type="email" name="email" placeholder="Email" className="border border-gray-300 rounded-md p-2 text-black" />
                </label>
                <label htmlFor="password">
                  Password
                  <input type="password" name="password" placeholder="Password" className="border border-gray-300 rounded-md p-2 text-black" />
                </label>
                <button type="submit" className='bg-gray-500 text-white p-2 rounded-md'>Sign Up</button>
            </form>
          </div>

            
            <p className='text-center'>or</p>

            <form action={async () => {
              "use server"
              await signIn("discord")
            }} className="flex flex-col gap-2">

              <button type="submit" className='bg-blue-500 text-white p-2 rounded-md'>Sign Up With Discord</button>
            </form>
      </div>



    </div>
  )
}