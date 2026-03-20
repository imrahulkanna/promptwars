import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processCrisisInput } from '../services/GeminiService';

// --- Mock the Google Generative AI module ---
const mockGenerateContent = vi.fn();
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue({
            generateContent: mockGenerateContent,
        }),
    })),
}));

// --- Mock Environment Variable ---
vi.stubEnv('VITE_GEMINI_API_KEY', 'TEST_API_KEY');

const VALID_TRIAGE_RESPONSE = {
    severity_score: 8,
    incident_type: 'Traumatic Head Injury',
    patient_status: 'Unconscious',
    action_steps: ['Check for breathing', 'Do not move the patient', 'Call 911'],
    priority: 'Critical',
    summary: 'A person fell and struck their head. They are unconscious and bleeding.',
    vitals_detected: ['unconscious', 'bleeding'],
    immediate_actions: ['Call 911', 'Do not move'],
    hospital_payload: {
        type: 'Trauma',
        severity: 8,
        eta_requirement: 'Immediate',
    },
};

describe('GeminiService - processCrisisInput', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // --- Happy Path ---
    it('should successfully parse a valid API response', async () => {
        mockGenerateContent.mockResolvedValue({
            response: { text: () => JSON.stringify(VALID_TRIAGE_RESPONSE) },
        });

        const result = await processCrisisInput('My friend fell and hit his head, he is not waking up, there is blood everywhere!');

        expect(result).toBeDefined();
        expect(result.severity_score).toBe(8);
        expect(result.incident_type).toBe('Traumatic Head Injury');
        expect(result.priority).toBe('Critical');
        expect(result.hospital_payload.eta_requirement).toBe('Immediate');
    });

    it('should strip markdown code blocks from the API response before parsing', async () => {
        const wrappedJson = '```json\n' + JSON.stringify(VALID_TRIAGE_RESPONSE) + '\n```';
        mockGenerateContent.mockResolvedValue({
            response: { text: () => wrappedJson },
        });

        const result = await processCrisisInput('Someone is unconscious in the parking lot, please help!');
        expect(result.severity_score).toBe(8);
    });

    // --- Input Validation ---
    it('should throw an error for inputs that are too short (<5 chars)', async () => {
        await expect(processCrisisInput('Hi')).rejects.toThrow(
            'Input too short to analyze.'
        );
    });

    it('should throw an error for whitespace-only input', async () => {
        await expect(processCrisisInput('    ')).rejects.toThrow(
            'Input too short to analyze.'
        );
    });

    // --- XSS Sanitization ---
    it('should sanitize XSS-like characters from input before sending to API', async () => {
        mockGenerateContent.mockResolvedValue({
            response: { text: () => JSON.stringify(VALID_TRIAGE_RESPONSE) },
        });

        await processCrisisInput('Patient has <script>alert("xss")</script> symptoms'); 

        // Verify that the prompt sent to API did NOT contain raw < or >
        const promptSent: string = mockGenerateContent.mock.calls[0][0];
        expect(promptSent).not.toContain('<script>');
        expect(promptSent).toContain('&lt;script&gt;');
    });

    // --- Fallback Behavior ---
    it('should return fallback triage data when the API call throws an error', async () => {
        mockGenerateContent.mockRejectedValue(new Error('Network Error'));

        const result = await processCrisisInput('Someone is hurt badly, I need help!');
        
        // Should NOT throw, instead return a fallback
        expect(result).toBeDefined();
        expect(result.priority).toBe('Critical');
        expect(result.severity_score).toBe(10);
        expect(result.summary).toContain('Automated analysis failed');
    });

    it('should return fallback triage data when the API returns malformed JSON', async () => {
        mockGenerateContent.mockResolvedValue({
            response: { text: () => 'This is definitely not JSON { malformed!' },
        });

        const result = await processCrisisInput('There is an emergency happening right now!');

        expect(result).toBeDefined();
        expect(result.severity_score).toBe(10);
        expect(result.hospital_payload.eta_requirement).toBe('Immediate');
    });

    // --- Missing API Key ---
    it('should throw a descriptive error when API key is missing', async () => {
        vi.stubEnv('VITE_GEMINI_API_KEY', '');
        await expect(processCrisisInput('valid emergency input here')).rejects.toThrow(
            'Missing Gemini API Key'
        );
        // Restore
        vi.stubEnv('VITE_GEMINI_API_KEY', 'TEST_API_KEY');
    });
});
