"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import type { ComponentType } from "react"

type SwaggerUIProps = {
  url?: string
  docExpansion?: "list" | "full" | "none"
  defaultModelsExpandDepth?: number
  defaultModelExpandDepth?: number
  displayRequestDuration?: boolean
  tryItOutEnabled?: boolean
  requestInterceptor?: (req: unknown) => unknown | Promise<unknown>
  responseInterceptor?: (res: unknown) => unknown | Promise<unknown>
}

// Dynamically import Swagger UI to avoid SSR issues
const SwaggerUI = dynamic<SwaggerUIProps>(
  () =>
    import("swagger-ui-react").then((mod) => {
      return (mod as { default?: ComponentType<SwaggerUIProps> }).default ??
        (mod as unknown as ComponentType<SwaggerUIProps>)
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        Loading API Documentation...
      </div>
    ),
  },
)

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Irminsul API Documentation
          </h1>
          <p className="text-gray-600">
            Interactive API documentation for Genshin Impact theorycrafting data
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <Suspense
            fallback={<div className="p-8 text-center">Loading...</div>}
          >
            <SwaggerUI
              url="/api/openapi"
              docExpansion="list"
              defaultModelsExpandDepth={1}
              defaultModelExpandDepth={1}
              displayRequestDuration={true}
              tryItOutEnabled={true}
              requestInterceptor={(req: any) => {
                // Add any custom request interceptors here
                return req
              }}
              responseInterceptor={(res: any) => {
                // Add any custom response interceptors here
                return res
              }}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
