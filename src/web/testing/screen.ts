/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  getQueriesForElement,
  Screen as TestingScreen,
  screen as testingScreen,
} from '@testing-library/dom';
import {allQueries} from 'web/testing/allQueries';

type Screen = TestingScreen<typeof allQueries>;

export const screen = getQueriesForElement(
  document.body,
  allQueries,
  // @ts-expect-error
  {
    logTestingPlaygroundURL: testingScreen.logTestingPlaygroundURL,
    debug: testingScreen.debug,
  },
) as Screen;
