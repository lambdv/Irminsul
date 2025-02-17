
import { redirect } from 'next/navigation'
import React from 'react'
import { auth } from '@/app/(auth)/auth'

import LoginPage from '@/app/(auth)/login/page'
import Stripe from './stripe'
export default async function page() {
    const session = await auth()
    // if (!session) 
    //     return <LoginPage message="you need to be logged in to donate" />   

    // const url = "https://donate.stripe.com/aEUbK9fJe7bi88wbII?prefilled_email=" + session.user.email
    // redirect(url)

    //     // return (
    //     //     <div style={{height: "100vh"}}>
    //     //         <Stripe priceId="price_1QrSZPHBez5qN0mfQLDwprk8" email={session.user.email}/>
    //     //     </div>
    //     // )


    return(
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                        Support Irminsul
                    </h2>
                    <p className="mt-4 text-xl text-gray-300">
                        Choose the tier that works best for you
                    </p>
                </div>

                <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
                    {/* Free Tier */}
                    <div className="border border-gray-700 rounded-lg shadow-sm divide-y divide-gray-700 bg-gray-800">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-white">Free</h3>
                            <p className="mt-4 text-gray-300">All the basics for getting started with Irminsul</p>
                            <p className="mt-8">
                                <span className="text-4xl font-extrabold text-white">$0</span>
                                <span className="text-base font-medium text-gray-400">/month</span>
                            </p>
                            <button className="mt-8 block w-full bg-gray-700 border border-gray-700 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-gray-600">
                                Current Plan
                            </button>
                        </div>
                        <div className="px-6 pt-6 pb-8">
                            <ul className="space-y-4">
                                <li className="flex space-x-3 text-gray-300">
                                    <span>✓ Access to all guides</span>
                                </li>
                                <li className="flex space-x-3 text-gray-300">
                                    <span>✓ Basic character builds</span>
                                </li>
                                <li className="flex space-x-3 text-gray-300">
                                    <span>✓ Community features</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Donator Tier */}
                    <div className="border border-primary-500 rounded-lg shadow-sm divide-y divide-gray-700 bg-gray-800">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-white">Donator</h3>
                            <p className="mt-4 text-gray-300">Support Irminsul and get exclusive features</p>
                            <p className="mt-8">
                                <span className="text-4xl font-extrabold text-white">$5</span>
                                <span className="text-base font-medium text-gray-400">/month</span>
                            </p>
                            <button className="mt-8 block w-full bg-primary-500 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-primary-600">
                                Become a Donator
                            </button>
                        </div>
                        <div className="px-6 pt-6 pb-8">
                            <ul className="space-y-4">
                                <li className="flex space-x-3 text-gray-300">
                                    <span>✓ All Free features</span>
                                </li>
                                <li className="flex space-x-3 text-gray-300">
                                    <span>✓ Ad-free experience</span>
                                </li>
                                <li className="flex space-x-3 text-gray-300">
                                    <span>✓ Early access to new features</span>
                                </li>
                                <li className="flex space-x-3 text-gray-300">
                                    <span>✓ Priority support</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Enterprise Tier */}
                    <div className="border border-gray-700 rounded-lg shadow-sm divide-y divide-gray-700 bg-gray-800">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-white">Enterprise</h3>
                            <p className="mt-4 text-gray-300">Custom solutions for organizations</p>
                            <p className="mt-8">
                                <span className="text-4xl font-extrabold text-white">Custom</span>
                            </p>
                            <button className="mt-8 block w-full bg-gray-700 border border-gray-700 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-gray-600">
                                Contact Us
                            </button>
                        </div>
                        <div className="px-6 pt-6 pb-8">
                            <ul className="space-y-4">
                                <li className="flex space-x-3 text-gray-300">
                                    <span>✓ All Donator features</span>
                                </li>
                                <li className="flex space-x-3 text-gray-300">
                                    <span>✓ Custom API access</span>
                                </li>
                                <li className="flex space-x-3 text-gray-300">
                                    <span>✓ Dedicated support</span>
                                </li>
                                <li className="flex space-x-3 text-gray-300">
                                    <span>✓ Custom integrations</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
