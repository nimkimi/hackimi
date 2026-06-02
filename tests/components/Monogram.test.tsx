import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Monogram from '@/components/brand/Monogram';

describe('Monogram', () => {
  it('renders an svg with the img role', () => {
    const { container } = render(<Monogram />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    // role="img" exposes it as an accessible image element.
    expect(screen.getByRole('img')).toBe(svg);
  });

  it("uses the default accessible label 'Nima Hakimi'", () => {
    render(<Monogram />);

    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Nima Hakimi');
  });

  it('uses a custom title prop as the accessible label', () => {
    render(<Monogram title="NH Logo" />);

    expect(screen.getByRole('img', { name: 'NH Logo' })).toHaveAttribute(
      'aria-label',
      'NH Logo',
    );
  });

  it('applies a passed className to the svg', () => {
    const { container } = render(<Monogram className="h-10 w-10 text-accent" />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-10', 'w-10', 'text-accent');
  });

  it('renders stroke-only geometry (the N and H paths)', () => {
    const { container } = render(<Monogram />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
    expect(container.querySelectorAll('path')).toHaveLength(2);
  });
});
