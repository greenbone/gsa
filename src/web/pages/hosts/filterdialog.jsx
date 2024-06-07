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
    name: 'hostname',
    displayName: _l('Hostname'),
  },
  {
    name: 'ip',
    displayName: _l('IP Address'),
  },
  {
    name: 'os',
    displayName: _l('Operating System'),
  },
  {
    name: 'severity',
    displayName: _l('Severity'),
  },
  {
    name: 'modified',
    displayName: _l('Modified'),
  },
];

export default createFilterDialog({
  sortFields: SORT_FIELDS,
});

// vim: set ts=2 sw=2 tw=80:
