/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import ComplianceBar from 'web/components/bar/ComplianceBar';
import SeverityBar from 'web/components/bar/SeverityBar';
import OsIcon from 'web/components/icon/OsIcon';
import SeverityClassLabel from 'web/components/label/SeverityClass';
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
    key: 'ip',
    title: _('IP Address'),
    width: '10%',
    sortBy: 'ip',
    render: entity => <span>{entity.ip}</span>,
  },
  {
    key: 'os',
    title: _('OS'),
    width: '1%',
    sortBy: 'os',
    align: 'center',
    render: entity => {
      const {details = {}} = entity;
      const {best_os_cpe, best_os_txt} = details;
      return <OsIcon osCpe={best_os_cpe} osTxt={best_os_txt} />;
    },
  },
  ...(audit
    ? [
        {
          key: 'complianceYes',
          title: _('Yes'),
          width: '4.5%',
          sortBy: 'complianceYes',
          render: entity => entity.complianceCounts?.yes,
        },
        {
          key: 'complianceNo',
          title: _('No'),
          width: '4.5%',
          sortBy: 'complianceNo',
          render: entity => entity.complianceCounts?.no,
        },
        {
          key: 'complianceIncomplete',
          title: _('Incomplete'),
          width: '4.5%',
          sortBy: 'complianceIncomplete',
          render: entity => entity.complianceCounts?.incomplete,
        },
      ]
    : [
        ...(useCVSSv3
          ? [
              {
                key: 'critical',
                title: _('Critical'),
                width: '3%',
                sortBy: 'critical',
                render: entity => entity.result_counts?.critical,
              },
            ]
          : []),
        {
          key: 'high',
          title: _('High'),
          width: '3%',
          sortBy: 'high',
          render: entity => entity.result_counts?.high,
        },
        {
          key: 'medium',
          title: _('Medium'),
          width: '3%',
          sortBy: 'medium',
          render: entity => entity.result_counts?.medium,
        },
        {
          key: 'low',
          title: _('Low'),
          width: '3%',
          sortBy: 'low',
          render: entity => entity.result_counts?.low,
        },
        {
          key: 'log',
          title: _('Log'),
          width: '3%',
          sortBy: 'log',
          render: entity => entity.result_counts?.log,
        },
        {
          key: 'false_positive',
          title: _('False Positive'),
          width: '3%',
          sortBy: 'false_positive',
          render: entity => entity.result_counts?.false_positive,
        },
      ]),
  ...(audit
    ? [
        {
          key: 'complianceTotal',
          title: _('Total'),
          width: '4.5%',
          sortBy: 'complianceTotal',
          render: entity => entity.complianceCounts?.total,
        },
        {
          key: 'compliant',
          title: _('Compliant'),
          width: '8%',
          sortBy: 'compliant',
          render: entity => (
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
          render: entity => entity.result_counts?.total,
        },
        {
          key: 'severity',
          title: _('Severity'),
          width: '8%',
          sortBy: 'severity',
          render: entity => <SeverityBar severity={entity.severity} />,
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

  const getSeverityLabel = (key: string) => {
    switch (key) {
      case 'critical':
        return <SeverityClassLabel.Critical />;
      case 'high':
        return <SeverityClassLabel.High />;
      case 'medium':
        return <SeverityClassLabel.Medium />;
      case 'low':
        return <SeverityClassLabel.Low />;
      case 'log':
        return <SeverityClassLabel.Log />;
      case 'false_positive':
        return <SeverityClassLabel.FalsePositive />;
      default:
        return undefined;
    }
  };

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
