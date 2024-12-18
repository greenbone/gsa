/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe} from '@gsa/testing';
import {testIcon} from 'web/components/icon/testing';

import PerformanceIcon from '../performanceicon';

describe('PerformanceIcon component tests', () => {
  testIcon(PerformanceIcon);
});
