/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe} from '@gsa/testing';
import {testIcon} from 'web/components/icon/Testing';
import UploadIcon from 'web/components/icon/UploadIcon';

describe('UploadIcon component tests', () => {
  testIcon(UploadIcon, {
    dataTestId: 'upload-icon',
    customDataTestId: 'custom-upload-icon',
  });
});
