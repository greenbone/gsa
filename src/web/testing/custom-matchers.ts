/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {expect} from 'vitest';

/**
 * Convert hex color to rgb format for getComputedStyle comparison
 * Handles both 3-character (#fff) and 6-character (#ffffff) hex codes
 */
export const hexToRgb = (hex: string): string => {
  const expandedHex = hex.replace(
    /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
    (_, r, g, b) => `#${r}${r}${g}${g}${b}${b}`,
  );
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(expandedHex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return `rgb(${Number.parseInt(result[1], 16)}, ${Number.parseInt(result[2], 16)}, ${Number.parseInt(result[3], 16)})`;
};

/**
 * Custom matcher to check computed style property
 */
function toHaveComputedStyle(
  this,
  element: HTMLElement,
  property: string,
  expectedValue: string,
) {
  const actualValue = getComputedStyle(element).getPropertyValue(property);

  const pass = actualValue === expectedValue;

  if (pass) {
    return {
      message: () =>
        `expected element not to have ${property}: ${expectedValue}, but got ${actualValue}`,
      pass: true,
    };
  } else {
    return {
      message: () =>
        `expected element to have ${property}: ${expectedValue}, but got ${actualValue}`,
      pass: false,
    };
  }
}

/**
 * Custom matcher to check computed background color against hex value
 */
function toHaveBackgroundColor(this, element: HTMLElement, hex: string) {
  const actualValue =
    getComputedStyle(element).getPropertyValue('background-color');
  const expectedValue = hexToRgb(hex);

  const pass = actualValue === expectedValue;

  if (pass) {
    return {
      message: () =>
        `expected element not to have background-color: ${hex} (${expectedValue}), but got ${actualValue}`,
      pass: true,
    };
  } else {
    return {
      message: () =>
        `expected element to have background-color: ${hex} (${expectedValue}), but got ${actualValue}`,
      pass: false,
    };
  }
}

/**
 * Custom matcher to check computed border color against hex value
 */
function toHaveBorderColor(this, element: HTMLElement, hex: string) {
  const actualValue =
    getComputedStyle(element).getPropertyValue('border-color');
  const expectedValue = hexToRgb(hex);

  const pass = actualValue === expectedValue;

  if (pass) {
    return {
      message: () =>
        `expected element not to have border-color: ${hex} (${expectedValue}), but got ${actualValue}`,
      pass: true,
    };
  } else {
    return {
      message: () =>
        `expected element to have border-color: ${hex} (${expectedValue}), but got ${actualValue}`,
      pass: false,
    };
  }
}

/**
 * Custom matcher to check computed text color against hex value
 */
function toHaveColor(this, element: HTMLElement, hex: string) {
  const actualValue = getComputedStyle(element).getPropertyValue('color');
  const expectedValue = hexToRgb(hex);

  const pass = actualValue === expectedValue;

  if (pass) {
    return {
      message: () =>
        `expected element not to have color: ${hex} (${expectedValue}), but got ${actualValue}`,
      pass: true,
    };
  } else {
    return {
      message: () =>
        `expected element to have color: ${hex} (${expectedValue}), but got ${actualValue}`,
      pass: false,
    };
  }
}

// Extend expect with custom matchers
expect.extend({
  toHaveComputedStyle,
  toHaveBackgroundColor,
  toHaveBorderColor,
  toHaveColor,
});

// Declare custom matcher types for TypeScript
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> {
    toHaveComputedStyle(property: string, expectedValue: string): T;
    toHaveBackgroundColor(hex: string): T;
    toHaveBorderColor(hex: string): T;
    toHaveColor(hex: string): T;
  }

  interface AsymmetricMatchersContaining {
    toHaveComputedStyle(property: string, expectedValue: string): unknown;
    toHaveBackgroundColor(hex: string): unknown;
    toHaveBorderColor(hex: string): unknown;
    toHaveColor(hex: string): unknown;
  }
}
