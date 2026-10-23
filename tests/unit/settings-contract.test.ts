import { describe, expect, it } from 'vitest';
import { UpdateUserSettingsInputSchema } from '../../packages/contracts/src/index.js';

/**
 * Settings stored whatever string a client sent, so a typo or a hostile value
 * in language or timezone was saved as-is. Both must be real values.
 */
describe('UpdateUserSettingsInputSchema language and timezone', () => {
  it.each(['en', 'en-GB', 'pt-BR', 'hi'])('accepts language %s', (language) => {
    expect(UpdateUserSettingsInputSchema.safeParse({ language }).success).toBe(true);
  });

  it.each(['UTC', 'Europe/London', 'Asia/Kolkata', 'America/New_York'])(
    'accepts timezone %s',
    (timezone) => {
      expect(UpdateUserSettingsInputSchema.safeParse({ timezone }).success).toBe(true);
    }
  );

  it.each(['??', 'english please', "en'; DROP", '<script>'])('rejects language %s', (language) => {
    expect(UpdateUserSettingsInputSchema.safeParse({ language }).success).toBe(false);
  });

  it.each(['Europe/Londn', 'Mars/Olympus', '<script>alert(1)</script>', 'x'.repeat(65)])(
    'rejects timezone %s',
    (timezone) => {
      expect(UpdateUserSettingsInputSchema.safeParse({ timezone }).success).toBe(false);
    }
  );

  it('still allows updating other settings without them', () => {
    expect(UpdateUserSettingsInputSchema.safeParse({ theme: 'dark' }).success).toBe(true);
  });
});
