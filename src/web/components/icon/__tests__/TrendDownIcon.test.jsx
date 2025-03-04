/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe} from '@gsa/testing';
import {testIcon} from 'web/components/icon/Testing';
import TrendDownIcon from 'web/components/icon/TrendDownIcon';

describe('TrendDownIcon component tests', () => {
  testIcon(TrendDownIcon, {
    dataTestId: 'trend-down-icon',
    customDataTestId: 'custom-trend-down-icon',
  });
});
