/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe} from '@gsa/testing';
import DeleteIcon from 'web/components/icon/DeleteIcon';
import {testIcon} from 'web/components/icon/Testing';

describe('DeleteIcon component tests', () => {
  testIcon(DeleteIcon, {
    dataTestId: 'delete-icon',
    customDataTestId: 'custom-delete-icon',
  });
});
