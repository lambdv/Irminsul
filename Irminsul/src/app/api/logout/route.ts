import { signOut } from "@/app/(auth)/auth";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await signOut();
  return NextResponse.redirect(new URL("/", request.url));
}