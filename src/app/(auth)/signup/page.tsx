import React from 'react'
import { handleSignUpSubmit } from '../actions'
import { signIn } from '@/app/auth'


export default function Page() {
  return (
    <div>
      <h1>Sign Up</h1>
      <form action={async () => {
        "use server"
        await signIn("github")
      }} className="flex flex-col gap-2">
        {/* <input type="text" name="username" placeholder="Username" className="border border-gray-300 rounded-md p-2 text-black" />
        <input type="email" name="email" placeholder="Email" className="border border-gray-300 rounded-md p-2 text-black" />
        <input type="password" name="password" placeholder="Password" className="border border-gray-300 rounded-md p-2 text-black" /> */}
        <button type="submit">Sign Up</button>
      </form>
    </div>
  )
}