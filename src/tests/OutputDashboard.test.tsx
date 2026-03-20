import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OutputDashboard } from '../components/OutputDashboard';
import type { TriageData } from '../types';

// Mock child component to isolate OutputDashboard
vi.mock('../components/DynamicHospitalBridge', () => ({
    DynamicHospitalBridge: () => <div data-testid="hospital-bridge-mock" />,
}));

const MOCK_CRITICAL: TriageData = {
    severity_score: 9,
    incident_type: 'Traumatic Head Injury',
    patient_status: 'Unconscious',
    action_steps: ['Call 911 immediately', 'Do not move the patient', 'Check for breathing'],
    priority: 'Critical',
    summary: 'A bystander reports a person who fell and struck their head.',
    vitals_detected: ['unconscious', 'bleeding'],
    immediate_actions: ['Call 911', 'Do not move'],
    hospital_payload: {
        type: 'Trauma',
        severity: 9,
        eta_requirement: 'Immediate',
    },
};

const MOCK_STABLE: TriageData = {
    severity_score: 2,
    incident_type: 'Minor Sprain',
    patient_status: 'Conscious and Alert',
    action_steps: ['Apply ice pack', 'Rest the limb'],
    priority: 'Stable',
    summary: 'User reports a twisted ankle while jogging.',
    vitals_detected: ['pain', 'swelling'],
    immediate_actions: ['Ice the area', 'Elevate the limb'],
    hospital_payload: {
        type: 'Minor Injury',
        severity: 2,
        eta_requirement: 'Normal',
    },
};

describe('OutputDashboard', () => {
    // --- Rendering ---
    it('renders the Bystander View and Hospital View sections', () => {
        render(<OutputDashboard resultData={MOCK_CRITICAL} />);
        expect(screen.getByText('Life-Saving Actions')).toBeInTheDocument();
        expect(screen.getByText('BYSTANDER VIEW')).toBeInTheDocument();
        expect(screen.getByText('Structured Triage Report')).toBeInTheDocument();
        expect(screen.getByText('HOSPITAL VIEW')).toBeInTheDocument();
    });

    it('renders the action steps from resultData', () => {
        render(<OutputDashboard resultData={MOCK_CRITICAL} />);
        expect(screen.getByText('Call 911 immediately')).toBeInTheDocument();
        expect(screen.getByText('Do not move the patient')).toBeInTheDocument();
        expect(screen.getByText('Check for breathing')).toBeInTheDocument();
    });

    it('renders the incident summary', () => {
        render(<OutputDashboard resultData={MOCK_CRITICAL} />);
        expect(screen.getByText('A bystander reports a person who fell and struck their head.')).toBeInTheDocument();
    });

    it('shows the severity score in the payload header', () => {
        render(<OutputDashboard resultData={MOCK_CRITICAL} />);
        expect(screen.getByText('SEVERITY: 9/10')).toBeInTheDocument();
    });

    it('shows the correct ETA requirement', () => {
        render(<OutputDashboard resultData={MOCK_CRITICAL} />);
        expect(screen.getByText('Immediate')).toBeInTheDocument();
    });

    it('falls back to immediate_actions if action_steps is empty', () => {
        const fallbackData: TriageData = {
            ...MOCK_STABLE,
            action_steps: [], // empty array forces fallback
        };
        render(<OutputDashboard resultData={fallbackData} />);
        expect(screen.getByText('Ice the area')).toBeInTheDocument();
        expect(screen.getByText('Elevate the limb')).toBeInTheDocument();
    });

    it('renders the hospital bridge sub-component', () => {
        render(<OutputDashboard resultData={MOCK_CRITICAL} />);
        expect(screen.getByTestId('hospital-bridge-mock')).toBeInTheDocument();
    });

    // --- Bridging Visual Indicator ---
    it('renders the "Payload Bridged & Transformed" visual connector', () => {
        render(<OutputDashboard resultData={MOCK_CRITICAL} />);
        expect(screen.getByText('Payload Bridged & Transformed')).toBeInTheDocument();
    });
    
    // --- A11y checks ---
    it('has accessible role="list" on the action steps', () => {
        render(<OutputDashboard resultData={MOCK_CRITICAL} />);
        const list = screen.getByRole('list', { name: /step by step life-saving instructions/i });
        expect(list).toBeInTheDocument();
    });
});
