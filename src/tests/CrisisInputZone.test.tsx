import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CrisisInputZone } from '../components/CrisisInputZone';

// Default props
const defaultProps = {
    input: '',
    setInput: vi.fn(),
    isLoading: false,
    loadingText: 'Analyzing Pulse...',
    error: null,
    handleProcess: vi.fn(),
    onSimulateTest: vi.fn(),
};

describe('CrisisInputZone', () => {
    it('renders the Crisis Input Zone heading', () => {
        render(<CrisisInputZone {...defaultProps} />);
        expect(screen.getByText('CRISIS INPUT ZONE')).toBeInTheDocument();
    });

    it('renders the textarea with the correct placeholder', () => {
        render(<CrisisInputZone {...defaultProps} />);
        const textarea = screen.getByLabelText('Crisis Input Text Area');
        expect(textarea).toBeInTheDocument();
    });

    it('calls setInput when the user types in the textarea', () => {
        render(<CrisisInputZone {...defaultProps} />);
        const textarea = screen.getByLabelText('Crisis Input Text Area');
        fireEvent.change(textarea, { target: { value: 'Someone is hurt!' } });
        expect(defaultProps.setInput).toHaveBeenCalledWith('Someone is hurt!');
    });

    it('disables textarea and button while loading', () => {
        render(<CrisisInputZone {...defaultProps} isLoading={true} />);
        const textarea = screen.getByLabelText('Crisis Input Text Area');
        const button = screen.getByRole('button', { name: /Processing Input/i });
        expect(textarea).toBeDisabled();
        expect(button).toBeDisabled();
    });

    it('disables the process button when input is empty', () => {
        render(<CrisisInputZone {...defaultProps} input="" />);
        const button = screen.getByRole('button', { name: /Process Panic Button/i });
        expect(button).toBeDisabled();
    });

    it('enables the process button when input has content', () => {
        render(<CrisisInputZone {...defaultProps} input="Patient is unconscious on the floor" />);
        const button = screen.getByRole('button', { name: /Process Panic Button/i });
        expect(button).not.toBeDisabled();
    });

    it('calls handleProcess when the button is clicked', () => {
        render(<CrisisInputZone {...defaultProps} input="Someone needs help urgently" />);
        const button = screen.getByRole('button', { name: /Process Panic Button/i });
        fireEvent.click(button);
        expect(defaultProps.handleProcess).toHaveBeenCalledTimes(1);
    });

    it('displays an error message when error is provided', () => {
        const errorMsg = 'Input too short to analyze.';
        render(<CrisisInputZone {...defaultProps} error={errorMsg} />);
        expect(screen.getByText(errorMsg)).toBeInTheDocument();
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('shows loading text while processing', () => {
        render(<CrisisInputZone {...defaultProps} isLoading={true} loadingText="Extracting medical facts..." />);
        expect(screen.getByText('Extracting medical facts...')).toBeInTheDocument();
    });

    describe('Simulated Test Suite buttons', () => {
        it('calls onSimulateTest with "short" when Short button is clicked', () => {
            render(<CrisisInputZone {...defaultProps} />);
            fireEvent.click(screen.getByLabelText('Simulate Short Input Test'));
            expect(defaultProps.onSimulateTest).toHaveBeenCalledWith('short');
        });

        it('calls onSimulateTest with "non-medical" when Non-Medical button is clicked', () => {
            render(<CrisisInputZone {...defaultProps} />);
            fireEvent.click(screen.getByLabelText('Simulate Non-Medical Input Test'));
            expect(defaultProps.onSimulateTest).toHaveBeenCalledWith('non-medical');
        });

        it('calls onSimulateTest with "empty" when Empty button is clicked', () => {
            render(<CrisisInputZone {...defaultProps} />);
            fireEvent.click(screen.getByLabelText('Simulate Empty Input Test'));
            expect(defaultProps.onSimulateTest).toHaveBeenCalledWith('empty');
        });
    });
});
