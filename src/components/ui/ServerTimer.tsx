"use client"
import { useEffect, useState } from 'react'
import styles from '@/app/index.module.css'

export default function ServerTimer() {
    const [times, setTimes] = useState({
        na: '',
        eu: '',
        asia: ''
    });

    useEffect(() => {
        const calculateTimeUntilReset = (timezone: number) => {
            const now = new Date();
            const serverTime = new Date(now.getTime() + (timezone + now.getTimezoneOffset()/60) * 3600 * 1000);
            const resetTime = new Date(serverTime);
            resetTime.setUTCHours(4, 0, 0, 0); // Server reset is at 4:00 AM

            if (serverTime > resetTime) {
                resetTime.setDate(resetTime.getDate() + 1);
            }

            const diff = resetTime.getTime() - serverTime.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            return `${hours}h ${minutes}m`;
        };

        const updateTimes = () => {
            setTimes({
                na: calculateTimeUntilReset(-5), // GMT-5
                eu: calculateTimeUntilReset(1),  // GMT+1
                asia: calculateTimeUntilReset(8) // GMT+8
            });
        };

        updateTimes();
        const interval = setInterval(updateTimes, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.serverTimer}>
            <div className="grid grid-cols-3 gap-2 md:gap-4">
                <div>
                    <div className="text-lg md:text-xl font-bold">NA</div>
                    <div className="text-xs md:text-sm text-gray-400">Reset in {times.na}</div>
                </div>
                <div>
                    <div className="text-lg md:text-xl font-bold">EU</div>
                    <div className="text-xs md:text-sm text-gray-400">Reset in {times.eu}</div>
                </div>
                <div>
                    <div className="text-lg md:text-xl font-bold">ASIA</div>
                    <div className="text-xs md:text-sm text-gray-400">Reset in {times.asia}</div>
                </div>
            </div>
        </div>
    );
} 