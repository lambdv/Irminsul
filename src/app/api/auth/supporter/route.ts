import { NextRequest, NextResponse } from 'next/server'
import { isUserSupporterByEmail } from '@/app/(main)/support/actions'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ isSupporter: false }, { status: 400 })
    }
    
    const isSupporter = await isUserSupporterByEmail(email)
    
    return NextResponse.json({ isSupporter })
  } catch (error) {
    console.error('Error checking supporter status:', error)
    return NextResponse.json({ isSupporter: false }, { status: 500 })
  }
} 