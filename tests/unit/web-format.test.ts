import { describe, expect, it } from 'vitest';
import { formatMoney, formatSalaryRange } from '../../apps/web/src/lib/format.js';

describe('web format: formatMoney', () => {
  it('keeps whole-dollar amounts without cents', () => {
    expect(formatMoney(9900, 'USD')).toBe('$99');
    expect(formatMoney(9000000, 'USD')).toBe('$90,000');
    expect(formatMoney(0, 'USD')).toBe('$0');
  });

  it('shows cents when the amount is not whole dollars', () => {
    expect(formatMoney(1999, 'USD')).toBe('$19.99');
    expect(formatMoney(19990, 'USD')).toBe('$199.90');
    expect(formatMoney(5, 'USD')).toBe('$0.05');
    expect(formatMoney(299901, 'USD')).toBe('$2,999.01');
  });

  it('falls back to a plain string for an invalid currency code', () => {
    expect(formatMoney(1999, 'not-a-currency')).toContain('not-a-currency');
  });

  it('formats a salary range with mixed precision', () => {
    expect(formatSalaryRange({ minMinor: 9000000, maxMinor: 12000050, currency: 'USD' })).toBe(
      '$90,000 – $120,000.50'
    );
    expect(formatSalaryRange(undefined)).toBeNull();
  });
});
