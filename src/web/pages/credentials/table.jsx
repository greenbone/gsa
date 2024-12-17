/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';

import CredentialDetails from './details';
import Row from './row';
import {createEntitiesFooter} from '../../entities/footer';
import {createEntitiesHeader} from '../../entities/header';
import {createEntitiesTable} from '../../entities/table';
import withRowDetails from '../../entities/withRowDetails';

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
