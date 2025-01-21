"use server"
import { signIn } from "@/app/(auth)/auth"
import { redirect } from "next/navigation"

export async function handleLogin() {
    await signIn("discord", { callbackUrl: "/" })
}