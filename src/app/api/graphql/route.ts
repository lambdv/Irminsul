import { schema } from '@/data-access/graphql'
import { createYoga } from 'graphql-yoga'

const yoga = createYoga({ schema })

export async function GET(req: Request) {
    return yoga.handle({ request: req })
}

export async function POST(req: Request) {
    return yoga.handle({ request: req })
}