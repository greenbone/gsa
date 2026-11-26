/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import type Credential from 'gmp/models/credential';
import TableData from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import {
  type HeaderComponentProps,
  type RowComponentProps,
} from 'web/entities/EntitiesTable';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import withRowDetails from 'web/entities/withRowDetails';
import useTranslation from 'web/hooks/useTranslation';
import {
  connectionServer,
  useTlsModeLabel,
} from 'web/pages/active-directory/useConnectionFormat';
import CredentialDetails from 'web/pages/credentials/CredentialDetails';

const ActiveDirectoryTableHeader = ({
  currentSortBy,
  currentSortDir,
  onSortChange,
}: HeaderComponentProps) => {
  const [_] = useTranslation();
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy="name"
          title={_('Name')}
          onSortChange={onSortChange}
        />
        <TableHead sort={false} title={_('Server')} />
        <TableHead sort={false} title={_('Search base')} />
        <TableHead sort={false} title={_('TLS mode')} />
      </TableRow>
    </TableHeader>
  );
};

const ActiveDirectoryTableRow = ({
  entity,
  preview,
}: RowComponentProps<Credential>) => {
  const [_] = useTranslation();
  const tlsModeLabel = useTlsModeLabel();
  return (
    <TableRow>
      <EntityNameTableData
        displayName={_('Active Directory connection')}
        entity={entity}
        preview={preview}
        type="credential"
      />
      <TableData>{connectionServer(entity) ?? _('Unavailable')}</TableData>
      <TableData style={{overflowWrap: 'anywhere'}}>
        {entity.adBaseDn || _('Unavailable')}
      </TableData>
      <TableData>{tlsModeLabel(entity.adTlsMode)}</TableData>
    </TableRow>
  );
};

export default createEntitiesTable<Credential>({
  emptyTitle: _l('No Active Directory credentials available.'),
  header: ActiveDirectoryTableHeader,
  row: ActiveDirectoryTableRow,
  rowDetails: withRowDetails<Credential>('credential', 4)(CredentialDetails),
});
