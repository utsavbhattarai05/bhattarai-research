/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import SaveButton from '@/components/ui/SaveButton';

describe('SaveButton', () => {
  it('shows default label in idle state', () => {
    render(<SaveButton state="idle" label="Save changes" />);
    expect(screen.getByText('Save changes')).toBeInTheDocument();
  });

  it('shows "Saving..." in saving state and is disabled', () => {
    render(<SaveButton state="saving" />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows "Saved!" in saved state', () => {
    render(<SaveButton state="saved" />);
    expect(screen.getByText('Saved!')).toBeInTheDocument();
  });

  it('shows error text in error state', () => {
    render(<SaveButton state="error" />);
    expect(screen.getByText('Failed — retry')).toBeInTheDocument();
  });

  it('is not disabled in idle, saved, or error states', () => {
    const { rerender } = render(<SaveButton state="idle" />);
    expect(screen.getByRole('button')).not.toBeDisabled();

    rerender(<SaveButton state="saved" />);
    expect(screen.getByRole('button')).not.toBeDisabled();

    rerender(<SaveButton state="error" />);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('uses custom label', () => {
    render(<SaveButton state="idle" label="Publish" />);
    expect(screen.getByText('Publish')).toBeInTheDocument();
  });
});
