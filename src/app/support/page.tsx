import { redirect } from 'next/navigation'
import React from 'react'
import { auth, getUser, getUserById, isAdmin } from '@/app/(auth)/auth'
import styles from './donate.module.css'
import { stripe } from '@/lib/stripe'
import { syncStripePayments } from './actions'
import Link from 'next/link'
import DonationGoal from './goal'
import { eq } from 'drizzle-orm'
import db from '@/db/db'
import { purchasesTable } from '@/db/schema/purchase'

export async function generateMetadata({params}) {
    return {
        title: "Donate | Irminsul",
    }
}

export default async function page() {
    const session = await auth()

    //const payments = await stripe.paymentIntents.list()

    const payments = await db.select().from(purchasesTable)
        .where(eq(purchasesTable.status, "succeeded"))
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
                    highlight={true}
                />
            </div>

            <DonationGoal goalAmount={40} payments={payments}/>

        </div>
    )
}

function DonateCard(props: {
    title: string,
    price: string,
    description: string,
    features: string[],
    buttonText?: string,
    isCurrent: boolean,
    href: string | null,
    highlight?: boolean,
}) {
    return (
        <div className={styles.donateCard + (props.highlight ? " " + styles.highlight : "")}>
            <h2 className={styles.cardTitle}>{props.title}</h2>
            <div className={styles.cardPrice}>{props.price}</div>
            <p className={styles.cardDescription}>{props.description}</p>
            <ul className={styles.featureList}>
                {props.features.map((feature, index) => {
                    if(feature==="500 SeelieAI tokens"){
                        return (
                            <li key={index}>
                                <i className="material-symbols-outlined">check</i>
                                <p style={{backgroundColor: "var(--primary-color)", borderRadius: "3px", padding: "1px 5px", color: "black"}}>{feature}</p>
                            </li>
                        )
                    }
                    return (
                        <li key={index}>
                            <i className="material-symbols-outlined">check</i>
                        {feature}
                    </li>
                    )
                })}
            </ul>
            <Link href={props.href}>
                <button 
                    className={props.isCurrent ? styles.currentTier : styles.donateButton
                        + " waves-effect waves-dark ripple "
                    }
                    style={{
                        backgroundColor: props.highlight ? "var(--primary-color)" : "var(--secondary-color)",
                        borderRadius: "3px",
                        color: "black",
                    }}
                >
                    {props.buttonText}
                </button>
            </Link>
        </div>
    )
}
