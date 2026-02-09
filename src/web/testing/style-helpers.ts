/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {expect} from 'vitest';

/**
 * Helper utilities for testing styled-components with getComputedStyle
 * Replacement for jest-styled-components toHaveStyleRule
 */

/**
 * Assert that an element has a specific computed style value
 * @param options - Object containing element, property, expectedValue, and optional matcher
 */
export const expectComputedStyle = ({
  element,
  property,
  expectedValue,
  matcher = 'toBe',
}: {
  element: HTMLElement;
  property: string;
  expectedValue: string;
  matcher?: 'toBe' | 'not.toBe' | 'toContain';
}) => {
  const actualValue = getComputedStyle(element).getPropertyValue(property);
  if (matcher === 'toBe') {
    expect(actualValue).toBe(expectedValue);
  } else if (matcher === 'not.toBe') {
    expect(actualValue).not.toBe(expectedValue);
  } else if (matcher === 'toContain') {
    expect(actualValue).toContain(expectedValue);
  }
};

/**
 * Convert hex color to rgb format for getComputedStyle comparison
 * Handles both 3-character (#fff) and 6-character (#ffffff) hex codes
 * @param hex - Hex color code (with or without #)
 * @returns RGB color string in format 'rgb(r, g, b)'
 * @throws Error if the hex is invalid
 */
export const hexToRgb = (hex: string): string => {
  // Handle 3-character hex codes like #fff by expanding them
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
