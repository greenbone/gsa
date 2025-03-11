/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe} from '@gsa/testing';
import {testIcon} from 'web/components/icon/Testing';
import TrendLessIcon from 'web/components/icon/TrendLessIcon';

describe('TrendLessIcon component tests', () => {
  testIcon(TrendLessIcon, {
    dataTestId: 'trend-less-icon',
    customDataTestId: 'custom-trend-less-icon',
  });
});
