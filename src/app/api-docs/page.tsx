"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// Dynamically import Swagger UI to avoid SSR issues
const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      Loading API Documentation...
    </div>
  ),
})

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
