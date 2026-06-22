/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import EmptyState from '@/components/ui/EmptyState';

describe('EmptyState', () => {
  it('renders the message', () => {
    render(<EmptyState message="No publications found." />);
    expect(screen.getByText('No publications found.')).toBeInTheDocument();
  });

  it('renders different messages', () => {
    const { rerender } = render(<EmptyState message="No milestones yet." />);
    expect(screen.getByText('No milestones yet.')).toBeInTheDocument();

    rerender(<EmptyState message="No unread messages." />);
    expect(screen.getByText('No unread messages.')).toBeInTheDocument();
  });
});
