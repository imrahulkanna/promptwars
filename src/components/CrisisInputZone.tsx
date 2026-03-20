import React from "react";
import { ShieldAlert, AlertTriangle, RefreshCw, Cpu, TestTube } from "lucide-react";

interface CrisisInputZoneProps {
    input: string;
    setInput: (val: string) => void;
    isLoading: boolean;
    loadingText: string;
    error: string | null;
    handleProcess: () => void;
    onSimulateTest: (type: "short" | "non-medical" | "empty") => void;
}

export const CrisisInputZone: React.FC<CrisisInputZoneProps> = ({
    input,
    setInput,
    isLoading,
    loadingText,
    error,
    handleProcess,
    onSimulateTest,
}) => {
    return (
        <section 
            className="bg-emergency-gray p-6 rounded-2xl border border-gray-800 shadow-2xl relative overflow-hidden group transition-all duration-300"
            aria-labelledby="crisis-input-title"
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-emergency-red"></div>

            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 id="crisis-input-title" className="text-xl font-bold flex items-center space-x-2">
                    <ShieldAlert className="w-5 h-5 text-emergency-yellow" aria-hidden="true" />
                    <span>CRISIS INPUT ZONE</span>
                </h2>
                
                {/* Simulated Test Suite */}
                <div className="flex bg-emergency-black/50 p-1.5 rounded-lg border border-gray-800 gap-2 items-center">
                    <span className="text-[10px] text-gray-500 font-mono tracking-wider ml-1 uppercase hidden md:inline">Test Suite:</span>
                    <button 
                        onClick={() => onSimulateTest("short")} 
                        className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded"
                        aria-label="Simulate Short Input Test"
                    >
                        Short
                    </button>
                    <button 
                        onClick={() => onSimulateTest("non-medical")} 
                        className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded"
                        aria-label="Simulate Non-Medical Input Test"
                    >
                        Non-Medical
                    </button>
                    <button 
                        onClick={() => onSimulateTest("empty")} 
                        className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded"
                        aria-label="Simulate Empty Input Test"
                    >
                        Empty
                    </button>
                </div>
            </div>

            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                aria-label="Crisis Input Text Area"
                aria-describedby="crisis-input-hint"
                className="w-full h-40 bg-emergency-black text-lg p-4 rounded-xl border border-gray-700 text-gray-100 focus:border-emergency-red focus:ring-1 focus:ring-emergency-red outline-none transition-all placeholder-gray-600 resize-none font-medium"
                placeholder="Type or paste messy, panicked input here... (e.g. 'Oh my god he fell, there is so much blood, I think he hit his head, he's not waking up, please help me!')"
            />
            <span id="crisis-input-hint" className="sr-only">Provide the raw textual description of the emergency event here.</span>

            <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                {error && (
                    <div 
                        className="text-emergency-red font-mono text-sm bg-red-950/30 py-2 px-3 rounded flex items-center w-full sm:w-auto overflow-hidden animate-in fade-in"
                        role="alert"
                        aria-live="assertive"
                    >
                        <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" aria-hidden="true" />
                        <span className="truncate">{error}</span>
                    </div>
                )}
                <div className={error ? "sm:ml-auto" : "w-full flex sm:justify-end"}>
                    <button
                        onClick={handleProcess}
                        disabled={isLoading || !input.trim()}
                        aria-label={isLoading ? "Processing Input" : "Process Panic Button"}
                        aria-live="polite"
                        className="group relative overflow-hidden rounded-xl bg-emergency-red hover:bg-emergency-red-dark transition-all px-8 py-4 font-bold text-xl tracking-wide disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,59,48,0.3)] hover:shadow-[0_0_30px_rgba(255,59,48,0.6)] w-full sm:w-auto"
                    >
                        {isLoading ? (
                            <span className="flex justify-center items-center space-x-3">
                                <RefreshCw className="w-6 h-6 animate-spin text-white" aria-hidden="true" />
                                <span>{loadingText}</span>
                            </span>
                        ) : (
                            <span className="flex justify-center items-center space-x-2">
                                <Cpu className="w-6 h-6 group-hover:scale-110 transition-transform" aria-hidden="true" />
                                <span>PROCESS PANIC BUTTON</span>
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </section>
    );
};
