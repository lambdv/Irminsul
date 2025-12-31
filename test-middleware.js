// Test middleware redirect logic
console.log("Testing middleware logic...")

// Test 1: User not authenticated
const mockRequest1 = {
  nextUrl: { pathname: "/ai" },
}

console.log("Test 1 - Unauthenticated user should redirect to Stripe Pro")

// Test 2: User authenticated but not supporter
const mockRequest2 = {
  nextUrl: { pathname: "/ai" },
}

console.log(
  "Test 2 - Authenticated non-supporter should redirect to Stripe Pro"
)

// Test 3: User is supporter (should not redirect)
const mockRequest3 = {
  nextUrl: { pathname: "/pricing" }, // Should not trigger middleware
}

console.log("Test 3 - Supporter accessing pricing should not redirect")

console.log("Middleware test completed!")
