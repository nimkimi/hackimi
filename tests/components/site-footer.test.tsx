import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import SiteFooter from '@/components/layout/SiteFooter';
import { SITE_AUTHOR, SITE_ROLE, SITE_LOCATION } from '@/lib/site';

describe('SiteFooter', () => {
  it('renders the © name-role-city line as visible text', () => {
    render(<SiteFooter />);
    const footer = screen.getByRole('contentinfo');
    const year = new Date().getFullYear();
    expect(footer).toHaveTextContent(`© ${year} ${SITE_AUTHOR} — ${SITE_ROLE}, ${SITE_LOCATION.city}`);
  });
});
