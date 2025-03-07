/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe} from '@gsa/testing';
import EditIcon from 'web/components/icon/EditIcon';
import {testIcon} from 'web/components/icon/Testing';

describe('EditIcon component tests', () => {
  testIcon(EditIcon, {
    dataTestId: 'edit-icon',
    customDataTestId: 'custom-edit-icon',
  });
});
