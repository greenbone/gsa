/* Copyright (C) 2018-2022 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {testing, beforeEach, expect} from '@gsa/testing';

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
