/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToastContainer, { toast } from '@/components/ui/Toast';

// Speed up timers
jest.useFakeTimers();

describe('Toast system', () => {
  beforeEach(() => {
    render(<ToastContainer />);
  });

  it('shows a success toast', () => {
    act(() => { toast.success('File saved', 'Your file was saved.'); });
    expect(screen.getByText('File saved')).toBeInTheDocument();
    expect(screen.getByText('Your file was saved.')).toBeInTheDocument();
  });

  it('shows an error toast', () => {
    act(() => { toast.error('Upload failed', 'Try again.'); });
    expect(screen.getByText('Upload failed')).toBeInTheDocument();
  });

  it('shows an info toast', () => {
    act(() => { toast.info('Email not verified'); });
    expect(screen.getByText('Email not verified')).toBeInTheDocument();
  });

  it('starts hiding toast when × is clicked (visible state changes)', () => {
    act(() => { toast.success('Dismiss me'); });
    expect(screen.getByText('Dismiss me')).toBeInTheDocument();
    const closeBtn = screen.getAllByRole('button')[0];
    // Clicking × initiates the dismiss — the item exists immediately after click
    act(() => { closeBtn.click(); });
    // After the 300ms removal timeout fires, it should be gone
    act(() => { jest.runAllTimers(); });
    expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument();
  });

  it('auto-dismisses after 4 seconds', () => {
    act(() => { toast.success('Auto dismiss'); });
    expect(screen.getByText('Auto dismiss')).toBeInTheDocument();
    act(() => { jest.advanceTimersByTime(4500); });
    expect(screen.queryByText('Auto dismiss')).not.toBeInTheDocument();
  });
});
