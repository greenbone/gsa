/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe} from '@gsa/testing';
import ResetIcon from 'web/components/icon/ResetIcon';
import {testIcon} from 'web/components/icon/Testing';

describe('ResetIcon component tests', () => {
  testIcon(ResetIcon, {
    dataTestId: 'reset-icon',
    customDataTestId: 'custom-reset-icon',
  });
});
