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
    name: 'latest_severity',
    displayName: _l('Severity: Latest'),
  },
  {
    name: 'highest_severity',
    displayName: _l('Severity: Highest'),
  },
  {
    name: 'average_severity',
    displayName: _l('Severity: Average'),
  },
  {
    name: 'all_hosts',
    displayName: _l('Hosts (All)'),
  },
  {
    name: 'hosts',
    displayName: _l('Hosts (Best OS)'),
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
