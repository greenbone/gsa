/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import type ReportHost from 'gmp/models/report/host';
import {isDefined} from 'gmp/utils/identity';
import ComplianceBar from 'web/components/bar/ComplianceBar';
import SeverityBar from 'web/components/bar/SeverityBar';
import DateTime from 'web/components/date/DateTime';
import {VerifyIcon, VerifyNoIcon} from 'web/components/icon';
import OsIcon from 'web/components/icon/OsIcon';
import IconDivider from 'web/components/layout/IconDivider';
import DetailsLink from 'web/components/link/DetailsLink';
import Link from 'web/components/link/Link';
import {
  getComplianceColumnsConfig,
  getSeverityColumnsConfig,
  getSeverityLabel,
} from 'web/components/table/SeverityColumns';
import TableData from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import useGmp from 'web/hooks/useGmp';
import {type SortDirectionType} from 'web/utils/sort-direction';

interface HeaderProps {
  audit?: boolean;
  currentSortBy?: string;
  currentSortDir?: SortDirectionType;
  sort?: boolean;
  onSortChange?: (sortBy: string) => void;
}

const renderAuthIcons = authSuccess => {
  const {smb, snmp, esxi, ssh} = authSuccess;
  const showSmbSuccess = smb === true;
  const showSmbFailure = smb === false;
  const showSnmpSuccess = snmp === true;
  const showSnmpFailure = snmp === false;
  const showEsxiSuccess = esxi === true;
  const showEsxiFailure = esxi === false;
  const showSshSuccess = ssh === true;
  const showSshFailure = ssh === false;
  return (
    <IconDivider>
      {showSmbSuccess && (
        <VerifyIcon title={_('SMB authentication was successful')} />
      )}
      {showSmbFailure && (
        <VerifyNoIcon title={_('SMB authentication was unsuccessful')} />
      )}
      {showSnmpSuccess && (
        <VerifyIcon title={_('SNMP authentication was successful')} />
      )}
      {showSnmpFailure && (
        <VerifyNoIcon title={_('SNMP authentication was unsuccessful')} />
      )}
      {showEsxiSuccess && (
        <VerifyIcon title={_('ESXi authentication was successful')} />
      )}
      {showEsxiFailure && (
        <VerifyNoIcon title={_('ESXi authentication was unsuccessful')} />
      )}
      {showSshSuccess && (
        <VerifyIcon title={_('SSH authentication was successful')} />
      )}
      {showSshFailure && (
        <VerifyNoIcon title={_('SSH authentication was unsuccessful')} />
      )}
    </IconDivider>
  );
};

const getColumns = (audit = false, useCVSSv3 = false) => [
  {
    key: 'ip',
    title: _('IP Address'),
    width: '10%',
    sortBy: 'ip',
    render: (entity: ReportHost, links = true) => {
      const {asset = {}, ip} = entity;
      return (
        <span>
          {isDefined(asset.id) ? (
            <DetailsLink id={asset.id} textOnly={!links} type="host">
              {ip}
            </DetailsLink>
          ) : (
            <Link filter={'name=' + ip} textOnly={!links} to="hosts">
              {ip}
            </Link>
          )}
        </span>
      );
    },
  },
  {
    key: 'hostname',
    title: _('Hostname'),
    width: '20%',
    sortBy: 'hostname',
    render: (entity: ReportHost) => <i>{entity.hostname}</i>,
  },
  {
    key: 'os',
    title: _('OS'),
    width: '1%',
    sortBy: 'os',
    align: 'center',
    render: (entity: ReportHost) => {
      const {details = {}} = entity;
      const {best_os_cpe, best_os_txt} = details;
      return <OsIcon osCpe={best_os_cpe} osTxt={best_os_txt} />;
    },
  },
  {
    key: 'portsCount',
    title: _('Ports'),
    width: '3%',
    sortBy: 'portsCount',
    render: (entity: ReportHost) => entity.portsCount,
  },
  {
    key: 'appsCount',
    title: _('Apps'),
    width: '3%',
    sortBy: 'appsCount',
    render: (entity: ReportHost) => entity.details?.appsCount,
  },
  {
    key: 'distance',
    title: _('Distance'),
    width: '3%',
    sortBy: 'distance',
    render: (entity: ReportHost) => entity.details?.distance,
  },
  {
    key: 'auth',
    title: _('Auth'),
    width: '8%',
    render: (entity: ReportHost) => renderAuthIcons(entity.authSuccess),
  },
  {
    key: 'start',
    title: _('Start'),
    width: '13%',
    sortBy: 'start',
    render: (entity: ReportHost) => <DateTime date={entity.start} />,
  },
  {
    key: 'end',
    title: _('End'),
    width: '13%',
    sortBy: 'end',
    render: (entity: ReportHost) => <DateTime date={entity.end} />,
  },
  ...(audit
    ? getComplianceColumnsConfig()
    : getSeverityColumnsConfig(useCVSSv3, '3%')),
  ...(audit
    ? [
        {
          key: 'complianceTotal',
          title: _('Total'),
          width: '4.5%',
          sortBy: 'complianceTotal',
          render: (entity: ReportHost) => entity.complianceCounts?.total,
        },
        {
          key: 'compliant',
          title: _('Compliant'),
          width: '8%',
          sortBy: 'compliant',
          render: (entity: ReportHost) => (
            <ComplianceBar compliance={entity.hostCompliance} />
          ),
        },
      ]
    : [
        {
          key: 'total',
          title: _('Total'),
          width: '3%',
          sortBy: 'total',
          render: (entity: ReportHost) => entity.result_counts?.total,
        },
        {
          key: 'severity',
          title: _('Severity'),
          width: '8%',
          sortBy: 'severity',
          render: (entity: ReportHost) => (
            <SeverityBar severity={entity.severity} />
          ),
        },
      ]),
];

const Header = ({
  audit = false,
  currentSortBy,
  currentSortDir,
  sort = true,
  onSortChange,
}: HeaderProps) => {
  const gmp = useGmp();
  const useCVSSv3 = gmp.settings.severityRating === 'CVSSv3';
  const columns = getColumns(audit, useCVSSv3);

  return (
    <TableHeader>
      <TableRow>
        {columns.map(column => {
          const severityLabel = getSeverityLabel(column.key);

          return (
            <TableHead
              key={column.key}
              currentSortBy={currentSortBy}
              currentSortDir={currentSortDir}
              sortBy={sort ? column.sortBy : undefined}
              title={column.title}
              width={column.width}
              onSortChange={onSortChange}
            >
              {severityLabel}
            </TableHead>
          );
        })}
      </TableRow>
    </TableHeader>
  );
};

const Row = ({entity, audit = false, links = true}) => {
  const gmp = useGmp();
  const useCVSSv3 = gmp.settings.severityRating === 'CVSSv3';
  const columns = getColumns(audit, useCVSSv3);

  return (
    <TableRow>
      {columns.map(column => (
        <TableData key={column.key} align={column.align}>
          {column.render(entity, links)}
        </TableData>
      ))}
    </TableRow>
  );
};

export default createEntitiesTable({
  header: Header,
  emptyTitle: _l('No Hosts available'),
  row: Row,
});
