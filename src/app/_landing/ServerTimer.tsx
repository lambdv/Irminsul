"use client"
import { useEffect, useState } from 'react'
import styles from '@/app/_landing/index.module.css'

const SERVERS = [
    { name: 'NA', offset: 6, color: '#4cbaff' },  // GMT-5 + 12 = GMT+7 (America)
    { name: 'EU', offset: 12, color: '#59cd4e' },   // GMT+1 + 12 = GMT+13 (Europe)
    { name: 'ASIA', offset: 19, color: '#773dff' }, // GMT+8 + 12 = GMT+20 (Asia)
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
                    return (
                        <div key={server.name} className={styles.legendItem}>
                            {/* <div className={styles.legendColor} style={{ backgroundColor: server.color }} /> */}
                            <div className="flex flex-col items-center justify-center">
                                <span style={{ color: server.color, fontWeight: 'bold' }} >{server.name}</span>
                                <span className={styles.legendTime}>{formatTime(serverTime)}</span>
                                <span className={styles.legendTime}>
                                    {(() => {
                                        const now = serverTime;
                                        const reset = new Date(now);
                                        reset.setHours(4, 0, 0, 0);
                                        if (now.getHours() >= 4) {
                                            reset.setDate(reset.getDate() + 1);
                                        }
                                        const diff = reset.getTime() - now.getTime();
                                        const hours = Math.floor(diff / (1000 * 60 * 60));
                                        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                        return `${hours}h ${minutes}m till daily reset`;
                                    })()}
                                </span>

                                <span className={styles.legendTime}>
                                    {(() => {
                                        const now = serverTime;
                                        const reset = new Date(now);
                                        reset.setHours(4, 0, 0, 0);
                                        // Get to next Monday
                                        while (reset.getDay() !== 1) {
                                            reset.setDate(reset.getDate() + 1);
                                        }
                                        reset.setDate(reset.getDate() - 1); // Subtract one day to fix the off-by-one
                                        const diff = reset.getTime() - now.getTime();
                                        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                        return `${days}d ${hours}h ${minutes}m till weekly reset`;
                                    })()}
                                </span>


                            </div>
                        </div>


                    );
                })}
            </div>
        </div>
    );
} 