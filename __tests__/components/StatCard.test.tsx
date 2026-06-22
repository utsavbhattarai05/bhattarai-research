/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import StatCard from '@/components/ui/StatCard';
import { FiDownload } from 'react-icons/fi';

describe('StatCard', () => {
  it('renders the value', () => {
    render(<StatCard label="Downloads" value={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders the label', () => {
    render(<StatCard label="Publications" value="1.2k" />);
    expect(screen.getByText('Publications')).toBeInTheDocument();
  });

  it('renders string value', () => {
    render(<StatCard label="Downloads" value="1.2k" />);
    expect(screen.getByText('1.2k')).toBeInTheDocument();
  });

  it('renders an icon when provided', () => {
    const { container } = render(<StatCard label="Downloads" value={10} icon={FiDownload} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders without icon', () => {
    const { container } = render(<StatCard label="Downloads" value={10} />);
    // Should still render label below the value (no icon variant)
    expect(screen.getByText('Downloads')).toBeInTheDocument();
  });
});
