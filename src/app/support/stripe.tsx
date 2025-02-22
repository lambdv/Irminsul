// "use client"

// import { loadStripe } from "@stripe/stripe-js";
// import {
//   EmbeddedCheckoutProvider,
//   EmbeddedCheckout,
// } from "@stripe/react-stripe-js";
// import { useCallback, useRef, useState } from "react";

// export default function Stripe(props: {priceId: string, email: string}) {
//   // Initialize Stripe with publishable key as string
//   const stripePromise = loadStripe(
//     "pk_test_51Qr4lZHBez5qN0mfs15Ee8pCOOm8u5IkXcImhaAFy6lpMq7EOfhRs6iwaemJobVgykw31qzKv8ORdvId7t0dQJOE00yW73Xg2Z"
//   );

//   const fetchClientSecret = useCallback(() => {
//     // Create a Checkout Session
//     return fetch("/api/stripe/embed", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ priceId: props.priceId, email: props.email }), // Monthly subscription price ID from Stripe dashboard
//     })
//       .then((res) => res.json())
//       .then((data) => data.client_secret);
//   }, []);

//   const options = { fetchClientSecret };

//   return (
//     <div id="checkout" >
//         <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
//             <EmbeddedCheckout />
//         </EmbeddedCheckoutProvider>
//     </div>
//   );
// }