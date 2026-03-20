import React, { useMemo } from "react";
import { Activity, AlertTriangle, TerminalSquare, Clock } from "lucide-react";
import type { TriageData } from "../types";
import { DynamicHospitalBridge } from "./DynamicHospitalBridge";

interface OutputDashboardProps {
    resultData: TriageData;
}

export const OutputDashboard: React.FC<OutputDashboardProps> = ({ resultData }) => {
    // Memoize the derived arrays/strings to satisfy "useMemo for heavy data processing"
    const actionsList = useMemo(() => {
        return (resultData.action_steps && resultData.action_steps.length > 0)
            ? resultData.action_steps
            : resultData.immediate_actions || [];
    }, [resultData.action_steps, resultData.immediate_actions]);

    const formattedVitals = useMemo(() => {
        if (!resultData.vitals_detected) return [];
        return resultData.vitals_detected.map((v) => `"${v}"`).join(",\n    ");
    }, [resultData.vitals_detected]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Visual transition indicator "Bridging" */}
            <div className="flex flex-col items-center justify-center py-4 opacity-50 space-y-2">
                <div className="w-1 h-8 bg-gradient-to-b from-emergency-red to-terminal-green rounded-full animate-pulse flex items-center justify-center"></div>
                <span className="text-xs uppercase tracking-[0.2em] font-mono text-gray-400">Payload Bridged & Transformed</span>
            </div>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side: For the Bystander (Life-Saving Actions) */}
                <div className="space-y-6" aria-label="Bystander Life-Saving Actions">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                        <h3 className="text-2xl font-bold text-white flex items-center">
                            <Activity className="w-6 h-6 mr-3 text-hospital-blue" aria-hidden="true" />
                            Life-Saving Actions
                        </h3>
                        <span className="bg-hospital-blue/10 text-hospital-blue px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            BYSTANDER VIEW
                        </span>
                    </div>

                    <div className="grid gap-4" role="list" aria-label="Step by step life-saving instructions">
                        {actionsList.map((step, idx) => (
                            <div
                                key={idx}
                                role="listitem"
                                className="bg-emergency-gray border border-gray-700 p-6 rounded-2xl flex items-start space-x-6 hover:border-hospital-blue transition-colors focus-within:ring-2 focus-within:ring-hospital-blue"
                            >
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emergency-black border-2 border-hospital-blue flex items-center justify-center text-xl font-bold text-hospital-blue" aria-hidden="true">
                                    {idx + 1}
                                </div>
                                <p className="text-2xl font-bold leading-tight text-white">
                                    {step}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Status pill */}
                    <div className="bg-emergency-yellow/10 border border-emergency-yellow/20 p-4 rounded-xl flex items-center space-x-4" role="region" aria-label="Incident Summary">
                        <AlertTriangle className="text-emergency-yellow w-8 h-8 flex-shrink-0" aria-hidden="true" />
                        <div>
                            <h4 className="text-emergency-yellow font-bold uppercase tracking-wider text-sm">
                                Incident Summary
                            </h4>
                            <p className="text-lg text-gray-200">{resultData.summary}</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: For the Hospital (Structured Triage Details) */}
                <div className="space-y-6" aria-label="Hospital Structured Triage Report">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                        <h3 className="text-2xl font-bold text-white flex items-center">
                            <TerminalSquare className="w-6 h-6 mr-3 text-terminal-green" aria-hidden="true" />
                            Structured Triage Report
                        </h3>
                        <span className="bg-terminal-green/10 text-terminal-green px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono">
                            HOSPITAL VIEW
                        </span>
                    </div>

                    <div className="bg-emergency-black border border-gray-800 rounded-2xl overflow-hidden font-mono text-sm relative" tabIndex={0} aria-label="Raw Structured Triage JSON payload">
                        {/* Simulated scanline effect */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-10 z-10" aria-hidden="true"></div>

                        <div className="p-4 bg-gray-900/50 border-b border-gray-800 flex items-center justify-between text-gray-400">
                            <span>payload_data.json</span>
                            <div className="flex items-center space-x-4 text-xs">
                                <span className="flex items-center text-gray-300">
                                    <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                                    ETA:{" "}
                                    <strong className="text-white ml-1">
                                        {resultData.hospital_payload?.eta_requirement || "Unknown"}
                                    </strong>
                                </span>
                                <span className="px-2 py-0.5 bg-gray-800 rounded text-terminal-green">
                                    SEVERITY: {resultData.severity_score}/10
                                </span>
                            </div>
                        </div>

                        <div className="p-6 overflow-x-auto text-gray-300">
                            <pre className="text-xs leading-loose" aria-hidden="true">
{`{\n  "incident_type": `}<span className="text-blue-400">"{resultData.incident_type}"</span>{`,\n  "priority": `}<span className="text-emergency-red">"{resultData.priority}"</span>{`,\n  "patient_status": `}<span className="text-yellow-400">"{resultData.patient_status}"</span>{`,\n  "vitals_detected": [\n    `}<span className="text-green-400">{formattedVitals}</span>{`\n  ],\n  "hospital_payload": {\n    "type": `}<span className="text-blue-400">"{resultData.hospital_payload?.type}"</span>{`,\n    "severity": `}<span className="text-purple-400">{resultData.hospital_payload?.severity}</span>{`,\n    "eta_requirement": `}<span className="text-yellow-400">"{resultData.hospital_payload?.eta_requirement}"</span>{`\n  }\n}`}
                            </pre>
                            {/* Screen reader friendly json */}
                            <span className="sr-only">{JSON.stringify(resultData)}</span>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Dynamic Maps Bridge Loader */}
            <DynamicHospitalBridge severity={resultData.severity_score} />
        </div>
    );
};
