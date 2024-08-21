/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

const SORT_FIELDS = [
  {
    name: 'subject_dn',
    displayName: _l('Subject DN'),
  },
  {
    name: 'issuer_dn',
    displayName: _l('Issuer DN'),
  },
  {
    name: 'serial',
    displayName: _l('Serial'),
  },
  {
    name: 'activates',
    displayName: _l('Activates'),
  },
  {
    name: 'expires',
    displayName: _l('Expires'),
  },
  {
    name: 'lastSeen',
    displayName: _l('Last Seen'),
  },
];

export default createFilterDialog({
  sortFields: SORT_FIELDS,
});

// vim: set ts=2 sw=2 tw=80:
