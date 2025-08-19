"use client";
import styles from "./calculator.module.css";
import CharacterSpecPanel from "./CharacterSpecPanel";
import FluidStatsPanel from "./FluidStatsPanel";
import TotalStatsPanel from "./TotalStatsPanel";
import RotationSpecPanel from "./RotationSpecPanel";
import ArtifactSubsPanel from "./ArtifactSubsPanel";
export default function CharacterCalculator() {
    return (
        <div className={styles.calculatorContainer}>
            <div id="character-spec" className={styles.panel}>
                <CharacterSpecPanel />
            </div>
        
            <div id="fluid-stats-spec" className={styles.panel}>
                <ArtifactSubsPanel />
                <FluidStatsPanel />
            </div>

            <div id="total-stats" className={styles.panel}>
                <TotalStatsPanel />
            </div>

            <div id="rotation-spec" className={styles.panel}>
                <RotationSpecPanel />
            </div>

        </div>
    );
}