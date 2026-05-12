/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import {_, _l} from 'gmp/locale/lang';
import type ReportTLSCertificate from 'gmp/models/report/tls-certificate';
import DateTime from 'web/components/date/DateTime';
import {DownloadIcon} from 'web/components/icon';
import Link from 'web/components/link/Link';
import TableData from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import RowDetailsToggle from 'web/entities/RowDetailsToggle';
import withRowDetails from 'web/entities/withRowDetails';
import TlsCertificateDetails from 'web/pages/tlscertificates/Details';
import {type SortDirectionType} from 'web/utils/sort-direction';

interface HeaderProps {
  actions?: boolean;
  currentSortBy?: string;
  currentSortDir?: SortDirectionType;
  sort?: boolean;
  onSortChange?: (sortBy: string) => void;
}

interface RowProps {
  actions?: boolean;
  entity: any;
  links?: boolean;
  onTlsCertificateDownloadClick?: (entity: ReportTLSCertificate) => void;
  onToggleDetailsClick?: (entity: any, id?: string) => void;
}

interface ColumnsProps {
  actions?: boolean;
  links?: boolean;
  onTlsCertificateDownloadClick?: (entity: ReportTLSCertificate) => void;
  onToggleDetailsClick?: (entity: any, id?: string) => void;
}

const Div = styled.div`
  word-break: break-all;
`;

const StyledSpan = styled.span`
  word-break: break-all;
`;

const getColumns = ({
  actions = true,
  links = true,
  onTlsCertificateDownloadClick,
  onToggleDetailsClick,
}: ColumnsProps) =>
  [
    {
      key: 'dn',
      title: _('Subject DN'),
      width: actions ? '35%' : '40%',
      sortBy: 'dn',
      render: (entity: ReportTLSCertificate) => (
        <StyledSpan>
          <RowDetailsToggle name={entity.id} onClick={onToggleDetailsClick}>
            <Div>{entity.subjectDn}</Div>
          </RowDetailsToggle>
        </StyledSpan>
      ),
    },
    {
      key: 'serial',
      title: _('Serial'),
      width: '10%',
      sortBy: 'serial',
      render: (entity: ReportTLSCertificate) => entity.serial,
    },
    {
      key: 'notvalidbefore',
      title: _('Activates'),
      width: '10%',
      sortBy: 'notvalidbefore',
      render: (entity: ReportTLSCertificate) => (
        <DateTime date={entity.activationTime} />
      ),
    },
    {
      key: 'notvalidafter',
      title: _('Expires'),
      width: '10%',
      sortBy: 'notvalidafter',
      render: (entity: ReportTLSCertificate) => (
        <DateTime date={entity.expirationTime} />
      ),
    },
    {
      key: 'ip',
      title: _('IP'),
      width: '10%',
      sortBy: 'ip',
      render: (entity: ReportTLSCertificate) => (
        <Link
          filter={'name=' + entity.ip}
          textOnly={!links}
          title={_('Show all Hosts with IP {{ip}}', {ip: entity.ip ?? ''})}
          to="hosts"
        >
          {entity.ip}
        </Link>
      ),
    },
    {
      key: 'hostname',
      title: _('Hostname'),
      width: '15%',
      sortBy: 'hostname',
      render: (entity: ReportTLSCertificate) => entity.hostname,
    },
    {
      key: 'port',
      title: _('Port'),
      width: '5%',
      sortBy: 'port',
      render: (entity: ReportTLSCertificate) => entity.port,
    },
    {
      key: 'actions',
      title: _('Actions'),
      width: '5%',
      align: 'center',
      render: (entity: ReportTLSCertificate) => (
        <DownloadIcon
          title={_('Download TLS Certificate')}
          value={entity}
          onClick={onTlsCertificateDownloadClick}
        />
      ),
      hidden: !actions,
    },
  ].filter(column => !column.hidden);

const Header = ({
  actions = true,
  currentSortDir,
  currentSortBy,
  sort = true,
  onSortChange,
}: HeaderProps) => {
  const columns = getColumns({actions});

  return (
    <TableHeader>
      <TableRow>
        {columns.map(column => (
          <TableHead
            key={column.key}
            align={column.align}
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sortBy={sort ? column.sortBy : undefined}
            title={column.title}
            width={column.width}
            onSortChange={onSortChange}
          />
        ))}
      </TableRow>
    </TableHeader>
  );
};

const Row = ({
  actions = true,
  entity,
  links = true,
  onTlsCertificateDownloadClick,
  onToggleDetailsClick,
}: RowProps) => {
  const columns = getColumns({
    actions,
    links,
    onTlsCertificateDownloadClick,
    onToggleDetailsClick,
  });

  return (
    <TableRow>
      {columns.map(column => (
        <TableData
          key={column.key}
          align={column.align === 'center' ? ['center', 'center'] : undefined}
        >
          {column.render(entity)}
        </TableData>
      ))}
    </TableRow>
  );
};

export default createEntitiesTable({
  header: Header,
  emptyTitle: _l('No TLS Certificates available'),
  row: Row,
  rowDetails: withRowDetails('tlscertificate', 6, false)(TlsCertificateDetails),
});
