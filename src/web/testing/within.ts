/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {getQueriesForElement} from '@testing-library/dom';
import {allQueries} from 'web/testing/all-queries';

export const within = (element: HTMLElement, queriesToBind = allQueries) =>
  getQueriesForElement(element, queriesToBind);
