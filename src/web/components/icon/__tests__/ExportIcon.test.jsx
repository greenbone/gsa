/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe} from '@gsa/testing';
import ExportIcon from 'web/components/icon/ExportIcon';
import {testIcon} from 'web/components/icon/Testing';

describe('ExportIcon component tests', () => {
  testIcon(ExportIcon, {
    dataTestId: 'export-icon',
    customDataTestId: 'custom-export-icon',
  });
});
