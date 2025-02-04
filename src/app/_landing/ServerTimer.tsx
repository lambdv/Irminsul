"use client"
import { useEffect, useState } from 'react'
import styles from '@/app/_landing/index.module.css'

const SERVERS = [
    { name: 'NA', offset: -5, color: '#4cbaff' },  // Eastern Time
    { name: 'EU', offset: 1, color: '#59cd4e' },   // Central European Time
    { name: 'ASIA', offset: 8, color: '#773dff' }, // China Standard Time
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
                            {i === 0 ? '12' : i}
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
                            <div
                                className={styles.minuteHand}
                                style={{
                                    transform: `rotate(${minuteRotation}deg)`,
                                    backgroundColor: server.color
                                }}
                            />
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
                            <div className={styles.legendColor} style={{ backgroundColor: server.color }} />
                            <div className="flex flex-col items-center justify-center">
                                <span>{server.name}</span>
                                <span className={styles.legendTime}>{formatTime(serverTime)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 