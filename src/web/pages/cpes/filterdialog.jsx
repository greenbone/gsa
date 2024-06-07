/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

const SORT_FIELDS = [
  {
    name: 'name',
    displayName: _l('Name'),
  },
  {
    name: 'title',
    displayName: _l('Title'),
  },
  {
    name: 'modified',
    displayName: _l('Modified'),
  },
  {
    name: 'cves',
    displayName: _l('CVEs'),
  },
  {
    name: 'severity',
    displayName: _l('Severity'),
  },
];

export default createFilterDialog({
  sortFields: SORT_FIELDS,
});

// vim: set ts=2 sw=2 tw=80:
