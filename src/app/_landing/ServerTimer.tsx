"use client"
import { useEffect, useState } from 'react'
import styles from '@/app/_landing/index.module.css'

const SERVERS = [
    { name: 'NA', offset: 6, color: '#4cbaff' },  // GMT-5 + 12 = GMT+7 (America)
    { name: 'EU', offset: -36, color: '#59cd4e' },   // GMT+1 + 12 - 48 = GMT-35 (Europe)
    { name: 'ASIA', offset: -29, color: '#773dff' }, // GMT+8 + 12 - 48 = GMT-28 (Asia)
];

export default function ServerTimer() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getServerTime = (server: typeof SERVERS[0]) => {
        const now = new Date(time);
        const utcHours = now.getUTCHours();
        const serverTime = new Date(now);
        serverTime.setUTCHours(utcHours + server.offset);
        return serverTime;
    };

    return (
        <div className={styles.clockWidget}>
            <div className={styles.clockFace}>
                {/* Clock numbers */}
                {[...Array(12)].map((_, i) => {
                    const rotation = (i * 30) - 90; // -90 to start at 12 o'clock
                    const radius = 85; // Reduced radius for better positioning
                    return (
                        <div
                            key={i}
                            className={styles.clockNumber}
                            style={{
                                transform: `rotate(${rotation}deg) translateX(${radius}px) rotate(-${rotation}deg)`
                            }}
                        >
                            {/* {i === 0 ? '12' : i} */}
                            {/* <p>.</p> */}
                            <span className="material-symbols-outlined" style={{ fontSize: '0.2rem', color: '#8b8888' }}>
                                radio_button_checked
                            </span>
                        </div>
                    );
                })}

                {/* Clock hands for each server */}
                {SERVERS.slice(0, 3).map(server => {
                    const serverTime = getServerTime(server);
                    const hours = serverTime.getHours() % 12;
                    const minutes = serverTime.getMinutes();
                    const seconds = serverTime.getSeconds();

                    const hourRotation = (hours * 30) + (minutes / 2);
                    const minuteRotation = (minutes * 6) + (seconds / 10);

                    return (
                        <div key={server.name} className={styles.handContainer}>
                            {/* Hour hand */}
                            <div
                                className={styles.hourHand}
                                style={{
                                    transform: `rotate(${hourRotation}deg)`,
                                    backgroundColor: server.color
                                }}
                            />
                            {/* Minute hand */}
                            {/* <div
                                className={styles.minuteHand}
                                style={{
                                    transform: `rotate(${minuteRotation}deg)`,
                                    backgroundColor: '#434242'
                                }}
                            /> */}
                        </div>
                    );
                })}

                {/* Center dot */}
                <div className={styles.clockCenter} />
            </div>

            {/* Legend */}
            <div className={styles.clockLegend}>
                {SERVERS.map(server => {
                    const serverTime = getServerTime(server);
                    
                    // Calculate daily reset time
                    const dailyReset = new Date(serverTime);
                    dailyReset.setHours(4, 0, 0, 0);
                    if (serverTime.getHours() >= 4) {
                        dailyReset.setDate(dailyReset.getDate() + 1);
                    }
                    const dailyDiff = dailyReset.getTime() - serverTime.getTime();
                    const dailyHours = Math.floor(dailyDiff / (1000 * 60 * 60));
                    const dailyMinutes = Math.floor((dailyDiff % (1000 * 60 * 60)) / (1000 * 60));
                    const dailyResetText = `${dailyHours}h ${dailyMinutes}m till daily reset`;

                    // Calculate weekly reset time
                    const weeklyReset = new Date(serverTime);
                    weeklyReset.setHours(4, 0, 0, 0);
                    // Set to next Sunday 4:00 AM server time
                    while (weeklyReset.getDay() !== 0) {
                        weeklyReset.setDate(weeklyReset.getDate() + 1);
                    }
                    // If we're past 4 AM Sunday, move to next week
                    if (serverTime.getDay() === 0 && serverTime.getHours() >= 4) {
                        weeklyReset.setDate(weeklyReset.getDate() + 7);
                    }
                    const weeklyDiff = weeklyReset.getTime() - serverTime.getTime();
                    const weeklyDays = Math.floor(weeklyDiff / (1000 * 60 * 60 * 24));
                    const weeklyHours = Math.floor((weeklyDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const weeklyMinutes = Math.floor((weeklyDiff % (1000 * 60 * 60)) / (1000 * 60));
                    const weeklyResetText = `${weeklyDays}d ${weeklyHours}h ${weeklyMinutes}m till weekly reset`;

                    return (
                        <div key={server.name} className={styles.legendItem}>
                            {/* <div className={styles.legendColor} style={{ backgroundColor: server.color }} /> */}
                            <div className="flex flex-col items-center justify-center">
                                <span style={{ color: server.color, fontWeight: 'bold' }} >{server.name}</span>
                                <span className={styles.legendTime}>{formatTime(serverTime)}</span>
                                <span className={styles.legendTime}>{dailyResetText}</span>
                                <span className={styles.legendTime}>{weeklyResetText}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 