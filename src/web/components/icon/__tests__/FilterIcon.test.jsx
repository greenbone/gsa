/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe} from '@gsa/testing';
import FilterIcon from 'web/components/icon/FilterIcon';
import {testIcon} from 'web/components/icon/Testing';

describe('FilterIcon component tests', () => {
  testIcon(FilterIcon, {
    dataTestId: 'filter-icon',
    customDataTestId: 'custom-filter-icon',
  });
});
