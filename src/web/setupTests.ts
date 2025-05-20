/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {testing, beforeEach, expect} from '@gsa/testing';
// eslint-disable-next-line no-restricted-imports
import '../setupTests';
// setup additional matchers for vitest
import '@testing-library/jest-dom/vitest';
import * as ResizeObserverModule from 'resize-observer-polyfill';

global.beforeEach = beforeEach;
global.expect = expect;

// Avoid "Error: Not implemented: navigation (except hash changes)"
// It is caused by clicking on <a> elements in tests
// https://stackoverflow.com/a/68038982/11044073
HTMLAnchorElement.prototype.click = testing.fn();

// use-combox from @mantine/core uses scrollIntoView and gives vitest error
Element.prototype.scrollIntoView = testing.fn();

// createObjectURL is not implemented in JSDOM and required for the Download component
window.URL.createObjectURL = testing.fn();

global.ResizeObserver = ResizeObserverModule.default;

// avoid TypeError: window.matchMedia is not a function for @mantine/core/Select
window.matchMedia = testing.fn().mockImplementation(query => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: testing.fn(), // deprecated
    removeListener: testing.fn(), // deprecated
    addEventListener: testing.fn(),
    removeEventListener: testing.fn(),
    dispatchEvent: testing.fn(),
  };
});
