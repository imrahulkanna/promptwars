export interface HospitalPayload {
    type: string;
    severity: number;
    eta_requirement: string;
}

export interface TriageData {
    severity_score: number;
    incident_type: string;
    patient_status: string;
    action_steps: string[]; // Note: keeping this explicit for UI needs, derived from immediate_actions

    // System Prompt specific keys:
    priority: "Critical" | "Urgent" | "Stable" | string;
    summary: string;
    vitals_detected: string[];
    immediate_actions: string[];
    hospital_payload: HospitalPayload;
}
