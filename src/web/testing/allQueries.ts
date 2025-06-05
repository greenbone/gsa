/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {queries} from '@testing-library/dom';
import * as customQueries from 'web/testing/customQueries';

export const allQueries = {
  ...queries,
  ...customQueries,
};
