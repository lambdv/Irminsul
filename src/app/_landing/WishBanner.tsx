'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import styles from './index.module.css';

// Sample banner data - in a real app this would likely come from props or an API
const bannerImages = [
    {
        src: "https://static.wikia.nocookie.net/gensin-impact/images/c/cd/The_Hearth%27s_Ashen_Shadow_2025-01-21.png",
        alt: "Featured Banner 1"
    },
    // {
    //     src: "https://static.wikia.nocookie.net/gensin-impact/images/4/4a/Illuminating_Lightning_2025-01-21.png",
    //     alt: "Featured Banner 2"
    // },
    // {
    //     src: "https://static.wikia.nocookie.net/gensin-impact/images/b/bc/Epitome_Invocation_2025-01-21.png",
    //     alt: "Featured Banner 3"
    // },
    // {
    //     src: "https://static.wikia.nocookie.net/gensin-impact/images/1/14/Remembrance_of_Jade_and_Stone_2025-01-21.png",
    //     alt: "Featured Banner 4"
    // }
];

export default function WishBanner() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [translateX, setTranslateX] = useState(0);
    const [hasTriggeredChange, setHasTriggeredChange] = useState(false);
    const dragThreshold = 75; // Minimum drag distance to trigger slide
    const contentRef = useRef<HTMLDivElement>(null);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
        setTranslateX(0);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
        setTranslateX(0);
    };

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        setHasTriggeredChange(false);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        setStartX(clientX);
    };

    const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;
        
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const diff = clientX - startX;
        setTranslateX(diff);

        // Check threshold during drag and trigger change immediately
        if (!hasTriggeredChange && Math.abs(diff) > dragThreshold) {
            if (diff > 0) {
                handlePrev();
            } else {
                handleNext();
            }
            setHasTriggeredChange(true);
        }

        // Prevent default to stop text selection during drag
        e.preventDefault();
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        setTranslateX(0);
        setHasTriggeredChange(false);
    };

    return (
        <div className={styles.wishBanner} style={{
            overflow: "hidden",
        }}>
            <div 
                ref={contentRef}
                className={styles.bannerContent}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
                style={{
                    cursor: isDragging ? 'grabbing' : 'grab',
                    transform: `translateX(${translateX}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                }}
            >
                <button 
                    onClick={handlePrev}
                    className={styles.carouselButton}
                    style={{ left: 20 }}
                    aria-label="Previous banner"
                >
                    <span className={styles.carouselButtonIcon + " material-symbols-outlined ml-2"}>arrow_back_ios</span>
                </button>
                


                <div className={styles.bannerImageWrapper}>
                    <Image 
                        src={bannerImages[currentIndex].src}
                        alt={bannerImages[currentIndex].alt}
                        width={1100}
                        height={1100}
                        className={styles.bannerImage}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "center",
                            pointerEvents: 'none' // Prevent image drag
                        }}
                        priority
                        draggable={false}
                        // unoptimized
                    />
                </div>

                <button 
                    onClick={handleNext}
                    className={styles.carouselButton}
                    style={{ right: 20 }}
                    aria-label="Next banner"
                >
                    <span className={styles.carouselButtonIcon + " material-symbols-outlined"}>arrow_forward_ios</span>
                </button>



                <div className={styles.bannerDots}>
                    {bannerImages.map((_, index) => (
                        <button
                            key={index}
                            className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
                            onClick={() => setCurrentIndex(index)}
                            aria-label={`Go to banner ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}