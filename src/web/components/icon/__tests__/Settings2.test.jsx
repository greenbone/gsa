/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe} from '@gsa/testing';
import Settings2 from 'web/components/icon/Settings2';
import {testIcon} from 'web/components/icon/Testing';

describe('Settings2 component tests', () => {
  testIcon(Settings2, {
    dataTestId: 'settings-2-icon',
    customDataTestId: 'custom-settings-2-icon',
  });
});
