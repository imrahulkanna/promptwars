import { useState, useEffect } from "react";
import { processCrisisInput } from "./services/GeminiService";
import type { TriageData } from "./types";
import {
    AlertTriangle,
    Activity,
    HeartPulse,
    ShieldAlert,
    Cpu,
    Clock,
    TerminalSquare,
    RefreshCw,
} from "lucide-react";
import { DynamicHospitalBridge } from './components/DynamicHospitalBridge';

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

    return (
        <div className="min-h-screen bg-transparent text-white selection:bg-emergency-yellow selection:text-emergency-black p-4 md:p-8 font-display">
            {/* Header */}
            <header className="flex items-center justify-between mb-8 pb-4 border-b border-emergency-gray">
                <div className="flex items-center space-x-3">
                    <HeartPulse className="w-8 h-8 text-emergency-red animate-pulse" />
                    <h1 className="text-3xl font-black tracking-tighter uppercase text-white">
                        Pulse<span className="text-emergency-red">Bridge</span>
                    </h1>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 font-mono">
                    <Activity className="w-4 h-4" />
                    <span>SYSTEM.ONLINE</span>
                </div>
            </header>

            <main className="max-w-7xl mx-auto space-y-12">
                {/* Crisis Input Zone */}
                <section className="bg-emergency-gray p-6 rounded-2xl border border-gray-800 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emergency-red"></div>

                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center space-x-2">
                            <ShieldAlert className="w-5 h-5 text-emergency-yellow" />
                            <span>CRISIS INPUT ZONE</span>
                        </h2>
                        <span className="text-xs text-gray-500 font-mono tracking-widest">
                            AWAITING RAW TRANSCRIPT
                        </span>
                    </div>

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        className="w-full h-40 bg-emergency-black text-lg p-4 rounded-xl border border-gray-700 text-gray-200 focus:border-emergency-red focus:ring-1 focus:ring-emergency-red outline-none transition-all placeholder-gray-600 resize-none font-medium"
                        placeholder="Type or paste messy, panicked input here... (e.g. 'Oh my god he fell, there is so much blood, I think he hit his head, he's not waking up, please help me!')"
                    />

                    <div className="mt-4 flex justify-between items-center">
                        {error && (
                            <div className="text-emergency-red font-mono text-sm bg-red-950/30 py-2 px-3 rounded flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                {error}
                            </div>
                        )}
                        <div className={error ? "ml-auto" : "w-full flex justify-end"}>
                            <button
                                onClick={handleProcess}
                                disabled={isLoading || !input.trim()}
                                className="group relative overflow-hidden rounded-xl bg-emergency-red hover:bg-emergency-red-dark transition-all px-8 py-4 font-bold text-xl tracking-wide disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,59,48,0.3)] hover:shadow-[0_0_30px_rgba(255,59,48,0.6)]"
                            >
                                {isLoading ? (
                                    <span className="flex items-center space-x-3">
                                        <RefreshCw className="w-6 h-6 animate-spin text-white" />
                                        <span>{loadingText}</span>
                                    </span>
                                ) : (
                                    <span className="flex items-center space-x-2">
                                        <Cpu className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                        <span>PROCESS PANIC BUTTON</span>
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Output Dashboard - Instantly visible when data arrives */}
                {resultData && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Side: For the Bystander (Life-Saving Actions) */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                                    <h3 className="text-2xl font-bold text-white flex items-center">
                                        <Activity className="w-6 h-6 mr-3 text-hospital-blue" />
                                        Life-Saving Actions
                                    </h3>
                                    <span className="bg-hospital-blue/10 text-hospital-blue px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                        BYSTANDER VIEW
                                    </span>
                                </div>

                                <div className="grid gap-4">
                                    {resultData.action_steps && resultData.action_steps.length > 0
                                        ? resultData.action_steps.map((step, idx) => (
                                              <div
                                                  key={idx}
                                                  className="bg-emergency-gray border border-gray-700 p-6 rounded-2xl flex items-start space-x-6 hover:border-hospital-blue transition-colors"
                                              >
                                                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emergency-black border-2 border-hospital-blue flex items-center justify-center text-xl font-bold text-hospital-blue">
                                                      {idx + 1}
                                                  </div>
                                                  <p className="text-2xl font-bold leading-tight">
                                                      {step}
                                                  </p>
                                              </div>
                                          ))
                                        : resultData.immediate_actions.map((step, idx) => (
                                              <div
                                                  key={idx}
                                                  className="bg-emergency-gray border border-gray-700 p-6 rounded-2xl flex items-start space-x-6 hover:border-hospital-blue transition-colors"
                                              >
                                                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emergency-black border-2 border-hospital-blue flex items-center justify-center text-xl font-bold text-hospital-blue">
                                                      {idx + 1}
                                                  </div>
                                                  <p className="text-2xl font-bold leading-tight">
                                                      {step}
                                                  </p>
                                              </div>
                                          ))}
                                </div>

                                {/* Status pill */}
                                <div className="bg-emergency-yellow/10 border border-emergency-yellow/20 p-4 rounded-xl flex items-center space-x-4">
                                    <AlertTriangle className="text-emergency-yellow w-8 h-8 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-emergency-yellow font-bold uppercase tracking-wider text-sm">
                                            Incident Summary
                                        </h4>
                                        <p className="text-lg text-gray-200">{resultData.summary}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: For the Hospital (Structured Triage Details) */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                                    <h3 className="text-2xl font-bold text-white flex items-center">
                                        <TerminalSquare className="w-6 h-6 mr-3 text-terminal-green" />
                                        Structured Triage Report
                                    </h3>
                                    <span className="bg-terminal-green/10 text-terminal-green px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono">
                                        HOSPITAL VIEW
                                    </span>
                                </div>

                                <div className="bg-emergency-black border border-gray-800 rounded-2xl overflow-hidden font-mono text-sm relative">
                                    {/* Simulated scanline effect */}
                                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-10 z-10"></div>

                                    <div className="p-4 bg-gray-900/50 border-b border-gray-800 flex items-center justify-between text-gray-500">
                                        <span>payload_data.json</span>
                                        <div className="flex items-center space-x-4 text-xs">
                                            <span className="flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                ETA:{" "}
                                                <strong className="text-white ml-1">
                                                    {resultData.hospital_payload.eta_requirement}
                                                </strong>
                                            </span>
                                            <span className="px-2 py-0.5 bg-gray-800 rounded text-terminal-green">
                                                SEVERITY: {resultData.severity_score}/10
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 overflow-x-auto text-gray-300">
                                        <pre className="text-xs leading-loose">
                                            {`{
  "incident_type": `}
                                            <span className="text-blue-400">
                                                "{resultData.incident_type}"
                                            </span>
                                            {`,
  "priority": `}
                                            <span className="text-emergency-red">
                                                "{resultData.priority}"
                                            </span>
                                            {`,
  "patient_status": `}
                                            <span className="text-yellow-400">
                                                "{resultData.patient_status}"
                                            </span>
                                            {`,
  "vitals_detected": [`}
                                            {resultData.vitals_detected.map(
                                                (v, i) =>
                                                    `    \n    ` +
                                                    (
                                                        <span key={i} className="text-green-400">
                                                            "{v}"
                                                        </span>
                                                    ) +
                                                    (i < resultData.vitals_detected.length - 1
                                                        ? ","
                                                        : ""),
                                            )}
                                            {`\n  ],
  "hospital_payload": {
    "type": `}
                                            <span className="text-blue-400">
                                                "{resultData.hospital_payload.type}"
                                            </span>
                                            {`,
    "severity": `}
                                            <span className="text-purple-400">
                                                {resultData.hospital_payload.severity}
                                            </span>
                                            {`,
    "eta_requirement": `}
                                            <span className="text-yellow-400">
                                                "{resultData.hospital_payload.eta_requirement}"
                                            </span>
                                            {`
  }
}`}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </section>
                        
                        {/* Dynamic Maps Bridge Loader */}
                        <DynamicHospitalBridge severity={resultData.severity_score} />
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
