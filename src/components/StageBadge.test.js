import { render, screen } from '@testing-library/react';
import StageBadge from './StageBadge';

describe('StageBadge', () => {
  it('renders the POC badge with the expected Tailwind classes', () => {
    render(<StageBadge stage="POC" />);

    const badge = screen.getByText('POC');

    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-full',
      'px-2.5',
      'py-0.5',
      'text-xs',
      'font-semibold',
      'uppercase',
      'bg-blue-100',
      'text-blue-700',
    );
  });
});
