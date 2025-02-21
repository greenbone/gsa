/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe} from '@gsa/testing';
import {testIcon} from 'web/components/icon/Testing';
import TlsCertificateIcon from 'web/components/icon/TlsCertificateIcon';

describe('TlsCertificateIcon component tests', () => {
  testIcon(TlsCertificateIcon);
});
