/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe} from '@gsa/testing';
import NewTicketIcon from 'web/components/icon/NewTicketIcon';
import {testIcon} from 'web/components/icon/Testing';

describe('NewOverrideIcon component tests', () => {
  testIcon(NewTicketIcon, {
    dataTestId: 'new-ticket-icon',
    customDataTestId: 'custom-new-ticket-icon',
  });
});
