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
    name: 'family',
    displayName: _l('Family'),
  },
  {
    name: 'created',
    displayName: _l('Created'),
  },
  {
    name: 'modified',
    displayName: _l('Modified'),
  },
  {
    name: 'version',
    displayName: _l('Version'),
  },
  {
    name: 'cve',
    displayName: _l('CVE'),
  },
  {
    name: 'solution_type',
    displayName: _l('Solution Type'),
  },
  {
    name: 'severity',
    displayName: _l('Severity'),
  },
  {
    name: 'qod',
    displayName: _l('QoD'),
  },
  {
    name: 'epss_score',
    displayName: _l('EPSS Score'),
  },
  {
    name: 'epss_percentile',
    displayName: _l('EPSS Percentile'),
  },
];

export default createFilterDialog({
  sortFields: SORT_FIELDS,
});

// vim: set ts=2 sw=2 tw=80:
