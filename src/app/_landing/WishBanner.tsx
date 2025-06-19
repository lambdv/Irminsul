'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './index.module.css';

const bannerImages = [
    {
        src: "https://static.wikia.nocookie.net/gensin-impact/images/7/78/Chanson_of_Many_Waters_2025-03-04.png",
        alt: "Featured Banner 1"
    },
    {
        src: "https://static.wikia.nocookie.net/gensin-impact/images/f/fa/Tempestuous_Destiny_2025-03-04.png", 
        alt: "Featured Banner 2"
    },
    {
        src: "https://static.wikia.nocookie.net/gensin-impact/images/0/0a/Epitome_Invocation_2025-03-04.png",
        alt: "Featured Banner 3"
    }
];

export default function WishBanner() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleNext = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
            setIsTransitioning(false);
        }, 300);
    };

    const handlePrev = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
            setIsTransitioning(false);
        }, 300);
    };

    return (
        <div className={styles.wishBanner}>
            <div className={styles.bannerContent}>
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
                        className={`${styles.bannerImage} ${isTransitioning ? styles.fadeTransition : ''}`}
                        style={{
                            width: "100%",
                            height: "auto",
                            objectFit: "contain",
                            objectPosition: "center",
                            userSelect: "none",
                            pointerEvents: "none",
                            clipPath: "inset(0)"
                        }}
                        priority
                        draggable={false}
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
                            onClick={() => {
                                setIsTransitioning(true);
                                setTimeout(() => {
                                    setCurrentIndex(index);
                                    setIsTransitioning(false);
                                }, 300);
                            }}
                            aria-label={`Go to banner ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}