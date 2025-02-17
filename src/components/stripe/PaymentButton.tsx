// import { useState } from 'react';
// import { loadStripe } from '@stripe/stripe-js';
// import {
//   Elements,
//   PaymentElement,
//   useStripe,
//   useElements,
// } from '@stripe/react-stripe-js';

// // Initialize Stripe
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// interface PaymentFormProps {
//   clientSecret: string;
// }

// function PaymentForm({ clientSecret }: PaymentFormProps) {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [error, setError] = useState<string | null>(null);
//   const [processing, setProcessing] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!stripe || !elements) {
//       return;
//     }

//     setProcessing(true);

//     const { error: submitError } = await stripe.confirmPayment({
//       elements,
//       confirmParams: {
//         return_url: `${window.location.origin}/payment/success`,
//       },
//     });

//     if (submitError) {
//       setError(submitError.message ?? 'An unexpected error occurred');
//       setProcessing(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
//       <PaymentElement />
//       {error && <div className="text-red-500 text-sm">{error}</div>}
//       <button
//         type="submit"
//         disabled={!stripe || processing}
//         className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
//       >
//         {processing ? 'Processing...' : 'Pay Now'}
//       </button>
//     </form>
//   );
// }

// interface PaymentButtonProps {
//   amount: number;
//   productId: string;
//   productName: string;
// }

// export default function PaymentButton({ amount, productId, productName }: PaymentButtonProps) {
//   const [clientSecret, setClientSecret] = useState<string | null>(null);

//   const handlePaymentStart = async () => {
//     try {
//       const response = await fetch('/api/stripe/create-payment-intent', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           amount,
//           productId,
//           productName,
//         }),
//       });

//       const data = await response.json();
//       setClientSecret(data.clientSecret);
//     } catch (error) {
//       console.error('Error starting payment:', error);
//     }
//   };

//   if (!clientSecret) {
//     return (
//       <button
//         onClick={handlePaymentStart}
//         className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
//       >
//         Start Payment
//       </button>
//     );
//   }

//   return (
//     <div className="w-full max-w-md mx-auto p-4 border rounded-lg shadow-sm">
//       <Elements stripe={stripePromise} options={{ clientSecret }}>
//         <PaymentForm clientSecret={clientSecret} />
//       </Elements>
//     </div>
//   );
// } 