/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import type Credential from 'gmp/models/credential';
import createEntitiesFooter, {
  type CreateEntitiesFooterProps,
} from 'web/entities/createEntitiesFooter';
import createEntitiesHeader, {
  type CreateEntitiesHeaderProps,
} from 'web/entities/createEntitiesHeader';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import withRowDetails from 'web/entities/withRowDetails';
import CredentialDetails from 'web/pages/credentials/CredentialDetails';
import CredentialTableRow, {
  type CredentialTableRowProps,
} from 'web/pages/credentials/CredentialTableRow';

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
    name: 'login',
    displayName: _l('Login'),
    width: '15%',
  },
];

const CredentialTable = createEntitiesTable<
  Credential,
  CreateEntitiesFooterProps<Credential>,
  CreateEntitiesHeaderProps,
  CredentialTableRowProps
>({
  emptyTitle: _l('No credentials available'),
  header: createEntitiesHeader(SORT_FIELDS),
  row: CredentialTableRow,
  rowDetails: withRowDetails<Credential>('credential', 10)(CredentialDetails),
  footer: createEntitiesFooter<Credential>({
    download: 'credentials.xml',
    span: 6,
    trash: true,
  }),
});

export default CredentialTable;
