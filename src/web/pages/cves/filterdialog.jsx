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
    name: 'vector',
    displayName: _l('Vector'),
  },
  {
    name: 'complexity',
    displayName: _l('Complexity'),
  },
  {
    name: 'authentication',
    displayName: _l('Authentication'),
  },
  {
    name: 'confidentiality_impact',
    displayName: _l('Confidentiality Impact'),
  },
  {
    name: 'integrity_impact',
    displayName: _l('Integrity Impact'),
  },
  {
    name: 'availability_impact',
    displayName: _l('Availability Impact'),
  },
  {
    name: 'published',
    displayName: _l('Published'),
  },
  {
    name: 'severity',
    displayName: _l('Severity'),
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
