/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe} from '@gsa/testing';
import StopIcon from 'web/components/icon/StopIcon';
import {testIcon} from 'web/components/icon/Testing';

describe('StopIcon component tests', () => {
  testIcon(StopIcon, {
    dataTestId: 'stop-icon',
    customDataTestId: 'custom-stop-icon',
  });
});
