/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import {createEntitiesFooter} from 'web/entities/Footer';
import {createEntitiesHeader} from 'web/entities/Header';
import {createEntitiesTable} from 'web/entities/Table';
import withRowDetails from 'web/entities/withRowDetails';

import CredentialDetails from './Details';
import Row from './Row';

export const SORT_FIELDS = [
  {
    name: 'name',
    displayName: _l('Name'),
    width: '36%',
  },
  {
    name: 'type',
    displayName: _l('Type'),
    width: '31%',
  },
  {
    name: 'allow_insecure',
    displayName: _l('Allow insecure use'),
    width: '10%',
  },
  {
    name: 'login',
    displayName: _l('Login'),
    width: '15%',
  },
];

const CredentialsTable = createEntitiesTable({
  emptyTitle: _l('No credentials available'),
  header: createEntitiesHeader(SORT_FIELDS),
  row: Row,
  rowDetails: withRowDetails('credential', 10)(CredentialDetails),
  footer: createEntitiesFooter({
    download: 'credentials.xml',
    span: 6,
    trash: true,
  }),
});

export default CredentialsTable;
