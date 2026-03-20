import { useState, useEffect } from "react";
import { processCrisisInput } from "./services/GeminiService";
import type { TriageData } from "./types";
import { Activity, HeartPulse } from "lucide-react";
import { CrisisInputZone } from "./components/CrisisInputZone";
import { OutputDashboard } from "./components/OutputDashboard";

function App() {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("Analyzing Pulse...");
    const [resultData, setResultData] = useState<TriageData | null>(null);
    const [error, setError] = useState<string | null>(null);

    // High-energy loading state text rotation
    useEffect(() => {
        if (!isLoading) return;
        const texts = [
            "Analyzing Pulse...",
            "Filtering emotional noise...",
            "Extracting medical facts...",
            "Structuring Life-Saving Data...",
            "Bridging communication...",
        ];
        let i = 0;
        const interval = setInterval(() => {
            i = (i + 1) % texts.length;
            setLoadingText(texts[i]);
        }, 800);
        return () => clearInterval(interval);
    }, [isLoading]);

    const handleProcess = async () => {
        if (!input.trim()) return;
        setIsLoading(true);
        setError(null);
        setResultData(null);

        try {
            const data = await processCrisisInput(input);
            setResultData(data);
        } catch (err: any) {
            setError(err.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSimulateTest = (type: "short" | "non-medical" | "empty") => {
        if (type === "short") setInput("Help!");
        if (type === "non-medical") setInput("My wifi down and I can't watch netflix. It is an emergency!");
        if (type === "empty") setInput("   ");
    };

    return (
        <div className="min-h-screen bg-transparent text-white selection:bg-emergency-yellow selection:text-emergency-black p-4 md:p-8 font-display">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-emergency-gray">
                <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-3 group cursor-default">
                        <HeartPulse className="w-8 h-8 text-emergency-red animate-pulse group-hover:scale-110 transition-transform" aria-hidden="true" />
                        <h1 className="text-3xl font-black tracking-tighter uppercase text-white">
                            Pulse<span className="text-emergency-red">Bridge</span>
                        </h1>
                    </div>
                    {/* Problem Statement Alignment: Added tooltip/subtitle */}
                    <p className="text-sm text-gray-400 max-w-sm tracking-wide" title="Bridging Human Intent to Complex Systems">
                        Bridging Human Intent to Complex Systems
                    </p>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-400 font-mono bg-emergency-gray px-3 py-1.5 rounded-full border border-gray-800" role="status" aria-live="polite">
                    <Activity className="w-4 h-4 text-terminal-green" aria-hidden="true" />
                    <span>SYSTEM.ONLINE</span>
                </div>
            </header>

            <main className="max-w-7xl mx-auto space-y-12">
                <CrisisInputZone 
                    input={input}
                    setInput={setInput}
                    isLoading={isLoading}
                    loadingText={loadingText}
                    error={error}
                    handleProcess={handleProcess}
                    onSimulateTest={handleSimulateTest}
                />

                {resultData && <OutputDashboard resultData={resultData} />}
            </main>
        </div>
    );
}

export default App;
