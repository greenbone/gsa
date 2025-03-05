/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe} from '@gsa/testing';
import {testIcon} from 'web/components/icon/Testing';
import TrashcanIcon from 'web/components/icon/TrashCanIcon';

describe('TrashcanIcon component tests', () => {
  testIcon(TrashcanIcon, {
    dataTestId: 'trashcan-icon',
    customDataTestId: 'custom-trashcan-icon',
  });
});
