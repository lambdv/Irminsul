import CharacterCalculator from "./components/CharacterCalculator";

export default function Calculator() {
    return <>
        <div className="flex flex-col gap-4">
            <h1>Calculator</h1>
            <CharacterCalculator />
        </div>
    </>
}