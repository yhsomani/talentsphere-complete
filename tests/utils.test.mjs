import test from 'node:test';
import assert from 'node:assert/strict';

// Test pure logic utility functions
import {
  getInitials,
  truncate,
  isValidEmail,
  formatCurrency,
  calculateLevel,
  getLevelDetails,
  calculateProgress,
  slugify,
  isEmpty,
  safeJsonParse,
  formatFileSize,
  extractYouTubeId,
  isValidUrl,
  cn
} from '../src/utils/index.ts';

test('getInitials extracts uppercase initials properly', () => {
  assert.equal(getInitials('John Doe'), 'JD');
  assert.equal(getInitials('Jane'), 'JA');
  assert.equal(getInitials('Alexander Graham Bell'), 'AB');
  assert.equal(getInitials(''), '');
});

test('truncate trims strings and appends ellipsis', () => {
  assert.equal(truncate('Hello World', 5), 'Hello…');
  assert.equal(truncate('Hello', 10), 'Hello');
  assert.equal(truncate('', 5), '');
});

test('isValidEmail validates email formats correctly', () => {
  assert.equal(isValidEmail('test@example.com'), true);
  assert.equal(isValidEmail('user.name+tag@sub.domain.org'), true);
  assert.equal(isValidEmail('invalid-email'), false);
  assert.equal(isValidEmail('@missinguser.com'), false);
  assert.equal(isValidEmail('missingdomain@'), false);
});

test('formatCurrency formats amounts into USD', () => {
  const formatted = formatCurrency(1250);
  assert.match(formatted, /\$1,250/);
});

test('calculateLevel maps XP to levels correctly', () => {
  assert.equal(calculateLevel(0), 1);
  assert.equal(calculateLevel(499), 1);
  assert.equal(calculateLevel(500), 2);
  assert.equal(calculateLevel(1500), 3);
  assert.equal(calculateLevel(3000), 4);
  assert.equal(calculateLevel(100000), 15);
  assert.equal(calculateLevel(150000), 15);
});

test('getLevelDetails computes level, thresholds, and percentage properly', () => {
  const info0 = getLevelDetails(0);
  assert.equal(info0.level, 1);
  assert.equal(info0.percentage, 0);

  const infoMid = getLevelDetails(250);
  assert.equal(infoMid.level, 1);
  assert.equal(infoMid.percentage, 50);

  const infoLvl3 = getLevelDetails(1500);
  assert.equal(infoLvl3.level, 3);
  assert.equal(infoLvl3.percentage, 0);
});

test('calculateProgress calculates percentages within bounds', () => {
  assert.equal(calculateProgress(50, 100), 50);
  assert.equal(calculateProgress(0, 100), 0);
  assert.equal(calculateProgress(100, 100), 100);
  assert.equal(calculateProgress(150, 100), 100); // capped at 100
  assert.equal(calculateProgress(10, 0), 0); // division by zero guarded
});

test('slugify converts strings to URL slugs', () => {
  assert.equal(slugify('Full Stack Engineer - Remote!'), 'full-stack-engineer-remote');
  assert.equal(slugify('  React & Node.js Developer  '), 'react-nodejs-developer');
});

test('isEmpty handles null, undefined, strings, arrays, and objects', () => {
  assert.equal(isEmpty(null), true);
  assert.equal(isEmpty(undefined), true);
  assert.equal(isEmpty(''), true);
  assert.equal(isEmpty('   '), true);
  assert.equal(isEmpty([]), true);
  assert.equal(isEmpty({}), true);
  assert.equal(isEmpty('active'), false);
  assert.equal(isEmpty([1]), false);
  assert.equal(isEmpty({ a: 1 }), false);
});

test('safeJsonParse parses valid json and returns fallback on invalid json', () => {
  assert.deepEqual(safeJsonParse('{"a":1}', {}), { a: 1 });
  assert.deepEqual(safeJsonParse('invalid-json', { fallback: true }), { fallback: true });
});

test('formatFileSize converts byte counts to human readable strings', () => {
  assert.equal(formatFileSize(0), '0 Bytes');
  assert.equal(formatFileSize(1024), '1 KB');
  assert.equal(formatFileSize(1024 * 1024 * 2.5), '2.5 MB');
});

test('extractYouTubeId extracts 11 character IDs from YouTube URLs', () => {
  assert.equal(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extractYouTubeId('https://example.com/video'), null);
});

test('isValidUrl verifies URLs', () => {
  assert.equal(isValidUrl('https://talentsphere.io/jobs'), true);
  assert.equal(isValidUrl('not-a-url'), false);
});

test('cn merges classnames and resolves tailwind conflicts', () => {
  const result = cn('p-4 text-red-500', false && 'hidden', 'text-blue-500');
  assert.equal(result, 'p-4 text-blue-500');
});
