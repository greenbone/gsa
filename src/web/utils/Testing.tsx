/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// jest-styled-components provides expect.toHaveStyleRule and snapshots for styled-components
// it requires global.beforeEach and expect
import 'jest-styled-components';

export {
  wait,
  waitFor,
  act,
  fireEvent,
  userEvent,
  screen,
  render,
  renderHook,
  rendererWith,
  rendererWithTable,
  rendererWithTableFooter,
  rendererWithTableRow,
} from 'web/testing';
