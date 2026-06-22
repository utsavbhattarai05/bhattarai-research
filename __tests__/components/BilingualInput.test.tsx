/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BilingualInput from '@/components/ui/BilingualInput';

describe('BilingualInput', () => {
  const defaultProps = {
    valueEn: 'English value',
    valueNe: 'नेपाली मान',
    onChangeEn: jest.fn(),
    onChangeNe: jest.fn(),
    placeholder: 'Enter text',
  };

  it('shows English tab active by default', () => {
    render(<BilingualInput {...defaultProps} />);
    const englishBtn = screen.getByText('English');
    expect(englishBtn).toHaveClass('bg-maroon-700');
  });

  it('shows the English value by default', () => {
    render(<BilingualInput {...defaultProps} />);
    expect(screen.getByDisplayValue('English value')).toBeInTheDocument();
  });

  it('switches to Nepali tab on click', async () => {
    render(<BilingualInput {...defaultProps} />);
    await userEvent.click(screen.getByText('नेपाली'));
    expect(screen.getByDisplayValue('नेपाली मान')).toBeInTheDocument();
  });

  it('calls onChangeEn when typing in English tab', async () => {
    const onChangeEn = jest.fn();
    render(<BilingualInput {...defaultProps} onChangeEn={onChangeEn} valueEn="" />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Hello');
    expect(onChangeEn).toHaveBeenCalled();
  });

  it('calls onChangeNe when typing in Nepali tab', async () => {
    const onChangeNe = jest.fn();
    render(<BilingualInput {...defaultProps} onChangeNe={onChangeNe} valueNe="" />);
    await userEvent.click(screen.getByText('नेपाली'));
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test');
    expect(onChangeNe).toHaveBeenCalled();
  });

  it('renders as textarea when multiline is true', () => {
    render(<BilingualInput {...defaultProps} multiline rows={4} />);
    expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA');
  });

  it('renders as input by default', () => {
    render(<BilingualInput {...defaultProps} />);
    expect(screen.getByRole('textbox').tagName).toBe('INPUT');
  });
});
