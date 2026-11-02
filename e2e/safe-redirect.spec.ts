import { expect, test } from '@playwright/test'
import { afterAuthPath, safeRedirectPath } from '../src/lib/safeRedirect'

test.describe('safeRedirectPath', () => {
  for (const [value, expected] of [
    ['/queue/abc', '/queue/abc'],
    ['/queue/abc?from=qr#ticket', '/queue/abc?from=qr#ticket'],
    ['/profile', '/profile'],
    ['/a/../queue', '/queue'],
  ] as const) {
    test(`keeps ${value}`, () => {
      expect(safeRedirectPath(value)).toBe(expected)
    })
  }

  for (const value of [
    null,
    '',
    'queue/abc',
    'https://evil.example/x',
    'HTTP://evil.example',
    '//evil.example/x',
    '///evil.example/x',
    '/\\evil.example/x',
    '\\\\evil.example/x',
    '/\t/evil.example/x',
    '/\n/evil.example/x',
    '/..//evil.example/x',
    '/.//evil.example/x',
    '/a/..//evil.example/x',
    'javascript:alert(1)',
    ' javascript:alert(1)',
    'data:text/html,evil',
  ]) {
    test(`refuses ${JSON.stringify(value)}`, () => {
      expect(safeRedirectPath(value)).toBeNull()
    })
  }
})

test.describe('afterAuthPath', () => {
  test('a claim goes to its claim page, encoded so it cannot leave it', () => {
    expect(afterAuthPath('abc-123', '/queue/x')).toBe('/access/abc-123')
    expect(afterAuthPath('a/../../evil?x=1', null)).toBe('/access/a%2F..%2F..%2Fevil%3Fx%3D1')
  })

  test('otherwise the checked redirect, then My Photos', () => {
    expect(afterAuthPath(null, '/queue/x')).toBe('/queue/x')
    expect(afterAuthPath(null, null)).toBe('/profile')
  })
})
