/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import createEntitiesFooter from 'web/entities/createEntitiesFooter';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import withRowDetails from 'web/entities/withRowDetails';
import PolicyDetails from 'web/pages/policies/Details';
import Header from 'web/pages/policies/Header';
import Row from 'web/pages/policies/Row';

export const SORT_FIELDS = [
  {
    name: 'name',
    displayName: _l('Name'),
  },
];

const PoliciesTable = createEntitiesTable({
  emptyTitle: _l('No Policies available'),
  header: Header,
  row: Row,
  rowDetails: withRowDetails('policy')(PolicyDetails),
  footer: createEntitiesFooter({
    download: 'policies.xml',
    span: 2,
    trash: true,
    tags: true,
  }),
});

export default PoliciesTable;
