import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import UnderlineLink from '@/components/motion/UnderlineLink';

describe('UnderlineLink', () => {
  it('renders a link with the correct href', () => {
    render(<UnderlineLink href="/work">Work</UnderlineLink>);

    const link = screen.getByRole('link', { name: 'Work' });
    expect(link).toHaveAttribute('href', '/work');
  });

  it('renders its children', () => {
    render(
      <UnderlineLink href="/about">
        <span data-testid="child">About me</span>
      </UnderlineLink>,
    );

    expect(screen.getByTestId('child')).toHaveTextContent('About me');
  });

  it('forwards extra props to the underlying link', () => {
    render(
      <UnderlineLink href="/contact" aria-label="Get in touch" data-cta="primary">
        Contact
      </UnderlineLink>,
    );

    const link = screen.getByRole('link', { name: 'Get in touch' });
    expect(link).toHaveAttribute('aria-label', 'Get in touch');
    expect(link).toHaveAttribute('data-cta', 'primary');
  });

  it('applies the underline classes and merges a custom className', () => {
    render(
      <UnderlineLink href="/" className="text-lg font-bold">
        Home
      </UnderlineLink>,
    );

    const link = screen.getByRole('link', { name: 'Home' });
    // Custom class merged in.
    expect(link).toHaveClass('text-lg', 'font-bold');
    // A few of the built-in underline classes.
    expect(link).toHaveClass('group', 'relative', 'inline-block', 'no-underline');
    expect(link).toHaveClass('after:bg-accent', 'hover:after:scale-x-100');
  });

  it('trims the trailing space when no className is provided', () => {
    render(<UnderlineLink href="/">Home</UnderlineLink>);

    const link = screen.getByRole('link', { name: 'Home' });
    expect(link.className.endsWith(' ')).toBe(false);
    expect(link.className.startsWith(' ')).toBe(false);
  });
});
