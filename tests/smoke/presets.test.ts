import { test, expect } from 'vitest';
import { PRESETS } from '../../src/presets/index.js';

test('placeholder test - add real tests', () => {
  expect(true).toBe(true);
});

test('presets are defined', () => {
  expect(Object.keys(PRESETS).length).toBeGreaterThan(0);
});

test('react-vite preset is defined', () => {
  const preset = PRESETS['react-vite'];
  expect(preset).toBeDefined();
  expect(preset.framework).toBe('react-vite');
  expect(preset.styling).toBe('tailwind');
});

test('t3-stack preset has required fields', () => {
  const preset = PRESETS['t3-stack'];
  expect(preset.framework).toBe('nextjs');
  expect(preset.aiConfig).toContain('claude-code');
});