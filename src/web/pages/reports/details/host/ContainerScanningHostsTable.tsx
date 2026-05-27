/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import type ReportHost from 'gmp/models/report/host';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import ComplianceBar from 'web/components/bar/ComplianceBar';
import SeverityBar from 'web/components/bar/SeverityBar';
import OsIcon from 'web/components/icon/OsIcon';
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

const getColumns = (audit = false, useCVSSv3 = false) => [
  {
    key: 'hostname',
    title: _('Image'),
    width: '10%',
    sortBy: 'hostname',
    render: (entity: ReportHost) => (
      <span title={entity.ip}>
        {isDefined(entity.hostname) ? shorten(entity.hostname, 80) : entity.ip}
      </span>
    ),
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

const Row = ({entity, audit = false}) => {
  const gmp = useGmp();
  const useCVSSv3 = gmp.settings.severityRating === 'CVSSv3';
  const columns = getColumns(audit, useCVSSv3);

  return (
    <TableRow>
      {columns.map(column => (
        <TableData key={column.key} align={column.align}>
          {column.render(entity)}
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
