/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe} from '@gsa/testing';
import {testIcon} from 'web/components/icon/Testing';
import TrendMoreIcon from 'web/components/icon/TrendMoreIcon';

describe('TrendMoreIcon component tests', () => {
  testIcon(TrendMoreIcon, {
    dataTestId: 'trend-more-icon',
    customDataTestId: 'custom-trend-more-icon',
  });
});
