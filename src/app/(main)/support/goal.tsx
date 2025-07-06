
"use client"
import { useEffect, useState } from 'react';

export default function DonationGoal(props: {
    goalAmount: number,
    payments: any[]
}) {
    const [totalDonations, setTotalDonations] = useState(0);

    console.log(props.payments)
    

    useEffect(() => {
        const fetchPayments = async () => {
            let paymentsThisMonth = props.payments.filter(payment => {
                //eg: 2025-02-25 21:57:54
                const paymentDate = new Date(payment.createdAt);

                console.log(paymentDate)
                
                return payment 
            });
            const total = paymentsThisMonth.reduce((acc, payment) => acc + payment.amount, 0);
            setTotalDonations(total);
        };

        fetchPayments();
    }, [props.payments]);

    const progressPercentage = (totalDonations / props.goalAmount) * 100;

    return (
        <div>
            <h2>Goal</h2>
            <div style={{borderRadius: '100px', overflow: 'hidden', backgroundColor: 'var(--light-elevated-color)' }}>
                <div
                    style={{
                        height: '20px',
                        width: `${progressPercentage}%`,
                        background: progressPercentage >= 100 ? 'green' : 'var(--primary-color)',
                        transition: 'width 0.5s',
                        borderRadius: '100px',
                    }}
                />
            </div>
            <p>${totalDonations.toFixed(2)} of ${props.goalAmount} raised</p>
        </div>
    );
};