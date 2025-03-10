/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe} from '@gsa/testing';
import StartIcon from 'web/components/icon/StartIcon';
import {testIcon} from 'web/components/icon/Testing';

describe('StartIcon component tests', () => {
  testIcon(StartIcon, {
    dataTestId: 'start-icon',
    customDataTestId: 'custom-start-icon',
  });
});
