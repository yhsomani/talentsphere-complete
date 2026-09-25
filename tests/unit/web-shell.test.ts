import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { colors, spacing, motion, breakpoints } from '../../packages/ui/src/index.js';

describe('PWA Frontend Shell & Design System (E-13, E-14, F-02, F-03)', () => {
  const webDir = path.resolve('apps/web');

  describe('PWA Web App Manifest', () => {
    it('provides a valid manifest.webmanifest with standalone display', () => {
      const manifestPath = path.join(webDir, 'public/manifest.webmanifest');
      expect(fs.existsSync(manifestPath)).toBe(true);

      const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      expect(manifestContent.name).toBe('TalentSphere Career OS');
      expect(manifestContent.short_name).toBe('TalentSphere');
      expect(manifestContent.display).toBe('standalone');
      expect(manifestContent.start_url).toBe('/');
      expect(manifestContent.theme_color).toBe('#0e8ce9');
    });
  });

  describe('HTML Shell & Meta Tags', () => {
    it('contains accessibility, viewport, and PWA link tags in index.html', () => {
      const htmlPath = path.join(webDir, 'index.html');
      expect(fs.existsSync(htmlPath)).toBe(true);

      const html = fs.readFileSync(htmlPath, 'utf8');
      expect(html).toContain(
        '<meta name="viewport" content="width=device-width, initial-scale=1.0"'
      );
      expect(html).toContain('<link rel="manifest" href="/manifest.webmanifest"');
      expect(html).toContain('<title>TalentSphere — Career Operating System</title>');
    });
  });

  describe('Design Tokens & Responsive Breakpoints', () => {
    it('defines accessible color scales with primary brand palette', () => {
      expect(colors.primary[600]).toBe('#026fc7');
      expect(colors.neutral[900]).toBe('#0f172a');
      expect(colors.semantic.success).toBe('#10b981');
      expect(colors.semantic.error).toBe('#ef4444');
    });

    it('defines spacing and motion scales', () => {
      expect(spacing.none).toBe('0px');
      expect(spacing.xs).toBe('4px');
      expect(spacing.md).toBe('16px');
      expect(spacing['2xl']).toBe('48px');

      expect(motion.duration.fast).toBe('150ms');
      expect(motion.duration.instant).toBe('0ms');
    });

    it('defines standard responsive layout breakpoints', () => {
      expect(breakpoints.sm).toBe('640px');
      expect(breakpoints.md).toBe('768px');
      expect(breakpoints.lg).toBe('1024px');
    });
  });
});
