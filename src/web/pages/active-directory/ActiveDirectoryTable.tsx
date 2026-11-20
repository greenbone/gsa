/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useLocation} from 'react-router';
import {_l} from 'gmp/locale/lang';
import type Credential from 'gmp/models/credential';
import {ActiveDirectoryIcon} from 'web/components/icon';
import Link from 'web/components/link/Link';
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
import {ROUTES} from 'web/route-paths';

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
        <TableHead align="center" sort={false} title={_('Actions')} />
      </TableRow>
    </TableHeader>
  );
};

const ActiveDirectoryTableRow = ({
  entity,
  onToggleDetailsClick,
}: RowComponentProps<Credential>) => {
  const [_] = useTranslation();
  const location = useLocation();
  const tlsModeLabel = useTlsModeLabel();
  const destination = ROUTES.activeDirectoryBrowser.url(entity.id);
  const navigationState = {connectionsSearch: location.search};
  return (
    <TableRow>
      <EntityNameTableData
        displayName={_('Active Directory connection')}
        entity={entity}
        type="credential"
        onToggleDetailsClick={onToggleDetailsClick}
      />
      <TableData>{connectionServer(entity) ?? _('Unavailable')}</TableData>
      <TableData style={{overflowWrap: 'anywhere'}}>
        {entity.adBaseDn || _('Unavailable')}
      </TableData>
      <TableData>{tlsModeLabel(entity.adTlsMode)}</TableData>
      <TableData align="center">
        <Link
          aria-label={_('Open directory: {{name}}', {
            name: entity.name ?? entity.id,
          })}
          state={navigationState}
          title={_('Open directory')}
          to={destination}
        >
          <ActiveDirectoryIcon forceStatic />
        </Link>
      </TableData>
    </TableRow>
  );
};

export default createEntitiesTable<Credential>({
  emptyTitle: _l('No Active Directory credentials available.'),
  header: ActiveDirectoryTableHeader,
  row: ActiveDirectoryTableRow,
  rowDetails: withRowDetails<Credential>('credential', 5)(CredentialDetails),
});
