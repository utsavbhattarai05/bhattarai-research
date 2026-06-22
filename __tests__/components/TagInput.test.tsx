/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagInput from '@/components/ui/TagInput';

describe('TagInput', () => {
  it('renders existing tags', () => {
    render(<TagInput tags={['Nepal', 'Research']} onChange={() => {}} />);
    expect(screen.getByText('Nepal')).toBeInTheDocument();
    expect(screen.getByText('Research')).toBeInTheDocument();
  });

  it('adds a tag on Enter', async () => {
    const onChange = jest.fn();
    render(<TagInput tags={[]} onChange={onChange} placeholder="Add tag" />);
    const input = screen.getByPlaceholderText('Add tag');
    await userEvent.type(input, 'Sustainability{Enter}');
    expect(onChange).toHaveBeenCalledWith(['Sustainability']);
  });

  it('does not add duplicate tags', async () => {
    const onChange = jest.fn();
    render(<TagInput tags={['Nepal']} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Nepal{Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('removes a tag when × is clicked', async () => {
    const onChange = jest.fn();
    render(<TagInput tags={['Nepal', 'Research']} onChange={onChange} />);
    const removeButtons = screen.getAllByRole('button');
    await userEvent.click(removeButtons[0]);
    expect(onChange).toHaveBeenCalledWith(['Research']);
  });

  it('removes last tag on Backspace when input is empty', async () => {
    const onChange = jest.fn();
    render(<TagInput tags={['Nepal', 'Research']} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await userEvent.click(input);
    await userEvent.keyboard('{Backspace}');
    expect(onChange).toHaveBeenCalledWith(['Nepal']);
  });

  it('trims whitespace before adding', async () => {
    const onChange = jest.fn();
    render(<TagInput tags={[]} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '  Policy  {Enter}');
    expect(onChange).toHaveBeenCalledWith(['Policy']);
  });
});
