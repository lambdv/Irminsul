import { redirect } from 'next/navigation'
import React from 'react'
import { auth } from '@/app/(auth)/auth'
import { getUser, getUserById, isAdmin } from '@/app/(auth)/actions'
import styles from './donate.module.css'
import { stripe } from '@/lib/stripe'
import { syncStripePayments } from './actions'
import Link from 'next/link'
import DonationGoal from './goal'
import { eq } from 'drizzle-orm'
import db from '@/db/db'
import { purchasesTable } from '@/db/schema/purchase'
import { BASE_TIER_TOKEN_AMOUNT, SUPPORT_TIER_TOKEN_AMOUNT } from './actions'

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

            <div className={styles.donateHeader}>
                <h1>Support Irminsul</h1>
                <p>Irminsul is Free and Open Source software. If you enjoy using it, consider donating to help support the development of the project.</p>
            </div>


            <div className={styles.donateCardDeck}>
                <DonateCard 
                    title="F2P"
                    price={<div style={{display: "grid", alignItems: "center"}}>
                        <span>Free</span>
                    </div>}                    
                    description="Full access to Irminsul"
                    features={[
                        "Access to data, articles and tools",
                        `${BASE_TIER_TOKEN_AMOUNT} SeelieAI tokens`,
                    ]}
                    isCurrent={true}
                    href=""
                />
                <DonateCard 
                    title="Supporter Tier"
                    price={<div style={{display: "grid", alignItems: "center"}}>
                        {/* <span style={{textDecoration: "line-through", marginRight: "8px", fontSize: "12px", color: "#838383"}}>$9.99</span> */}
                        <span>
                            $4.99 
                            {/* <span style={{fontSize: "12px", color: "#838383"}}> (50% off)</span> */}
                        </span>
                    </div>}
                    description="Enhanced experience"
                    features={[
                        "Everything in Free tier",
                        "Ad-Free experience",
                        `+${SUPPORT_TIER_TOKEN_AMOUNT} SeelieAI tokens`,
                        "Verified badge on your profile",
                        "Early access to new preview features",
                    ]}
                    buttonText="Donate"
                    isCurrent={false}
                    href={session ? "https://buy.stripe.com/5kAaG57cIdzGgF2cMO?prefilled_email=" + session.user.email : "/login"}
                    highlight={true}
                />
            </div>

            {/* <DonationGoal goalAmount={40} payments={payments}/> */}

        </div>
    )
}

function DonateCard(props: {
    title: string,
    price: React.ReactNode,
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
                    if(feature==="+" + SUPPORT_TIER_TOKEN_AMOUNT + " SeelieAI tokens"){
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
