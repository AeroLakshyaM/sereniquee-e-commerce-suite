import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BrandLoader } from './BrandLoader';

describe('BrandLoader', () => {
  it('renders the Sereniquee Candles emblem and accessible loading status', () => {
    render(<BrandLoader />);

    const status = screen.getByRole('status', { name: 'Loading Sereniquee Candles' });
    const logo = screen.getByAltText('Sereniquee Candles') as HTMLImageElement;

    expect(status).toBeTruthy();
    expect(logo.getAttribute('src')).toBe('/footer_logo.png');
  });
});
