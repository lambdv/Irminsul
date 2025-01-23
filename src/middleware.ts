import { NextResponse } from 'next/server'
import { isAuthenticated } from './app/(auth)/auth'

export async function middleware(request) {
    const path = request.nextUrl.pathname
    if(path.startsWith('/characters/ayaka') || path.startsWith('/characters/ayaka/') ){
        return NextResponse.redirect(new URL('/archive/characters/kamisato-ayaka', request.url))
    }

    if(path.startsWith('/characters/')){
        return NextResponse.redirect(new URL('/archive/characters/' + path.split('/')[2], request.url))
    }

    

    if(path.startsWith('/weapons/')){
        return NextResponse.redirect(new URL('/archive/weapons/' + path.split('/')[2], request.url))
    }

    if(path.startsWith('/artifacts/')){
        return NextResponse.redirect(new URL('/archive/artifacts/' + path.split('/')[2], request.url))
    }





}

// export const config = {
//     matcher: [ 
//         '/seelie/:path*', 
//         '/archive/:path*',
//     ]
// }
