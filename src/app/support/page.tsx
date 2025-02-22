import { redirect } from 'next/navigation'
import React from 'react'
import { auth, getUser, getUserById, isAdmin } from '@/app/(auth)/auth'
import styles from './donate.module.css'
import { stripe } from '@/lib/stripe'
import { syncStripePayments } from './actions'
import Link from 'next/link'

export async function generateMetadata({params}) {
    return {
        title: "Donate | Irminsul",
    }
}

export default async function page() {
    const session = await auth()

    const payments = await stripe.paymentIntents.list()

    // await syncStripePayments()

    return (
        <div className={styles.donateContainer}>

            {/* {admin && (
                <div className={styles.adminContainer}>
                    <h2>Stripe Payments</h2>
                    <div>
                        {payments.data.map((payment) => (
                            <div key={payment.id}>
                                <p>Id: {payment.id}</p>
                                <p>Amount: ${(payment.amount / 100).toFixed(2)}</p>
                                <p>Status: {payment.status}</p>
                                <p>Created: {new Date(payment.created * 1000).toLocaleString()}</p>
                                <p>Email: {payment.receipt_email}</p>
                                <hr/>
                            </div>
                        ))}
                    </div>
                    <br />
                </div>
            )} */}


            <div className={styles.donateHeader}>
                <h1>Support Irminsul</h1>
                <p>Irminsul is Free and Open Source software. If you enjoy using it, consider donating to help support the development of the project.</p>
                <p>Supporter accounts gain access to </p>
            </div>


            <div className={styles.donateCardDeck}>
                <DonateCard 
                    title="F2P"
                    price="$0"
                    description="Full access to Irminsul"
                    features={[
                        "Access to data, APIs, articles and tools",
                        "20 SeelieAI tokens",
                    ]}
                    buttonText="Current"
                    isCurrent={true}
                    href=""
                />
                <DonateCard 
                    title="Supporter Tier"
                    price="$4.99"
                    description="Enhanced experience "
                    features={[
                        "Everything in Free tier",
                        "Ad-Free experience",
                        "500 SeelieAI tokens",
                        "Verified badge on your profile",
                        "Early access to new features in production",
                    ]}
                    buttonText="Donate"
                    isCurrent={false}
                    href={session ? "https://buy.stripe.com/5kAaG57cIdzGgF2cMO?prefilled_email=" + session.user.email : "/login"}
                />
            </div>
        </div>
    )
}

function DonateCard(props: {
    title: string,
    price: string,
    description: string,
    features: string[],
    buttonText: string,
    isCurrent: boolean,
    href: string | null,
}) {
    return (
        <div className={styles.donateCard}>
            <h2 className={styles.cardTitle}>{props.title}</h2>
            <div className={styles.cardPrice}>{props.price}</div>
            <p className={styles.cardDescription}>{props.description}</p>
            <ul className={styles.featureList}>
                {props.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                ))}
            </ul>
            <Link href={props.href}>
                <button 
                    className={props.isCurrent ? styles.currentTier : styles.donateButton}
                >
                    {props.buttonText}
                </button>
            </Link>
        </div>
    )
}
