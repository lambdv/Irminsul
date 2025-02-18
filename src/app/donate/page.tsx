
import { redirect } from 'next/navigation'
import React from 'react'
import { auth } from '@/app/(auth)/auth'
import styles from './donate.module.css'


export async function generateMetadata({params}) {
    return {
        title: "Donate | Irminsul",
        description: "Support Irminsul and help us continue to provide the best metagaming information in Teyvat",
    }
}
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
        <div>
            <h1>Donate</h1>

            <div className={styles.donateCardContainer}>

            </div>

        </div>
    )
}


function DonateCard(){
    return (
        <div>
            <h1>Donate</h1>
        </div>
    )
}
