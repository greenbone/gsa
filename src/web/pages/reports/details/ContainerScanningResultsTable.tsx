/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import type Nvt from 'gmp/models/nvt';
import type Result from 'gmp/models/result';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import SeverityBar from 'web/components/bar/SeverityBar';
import DateTime from 'web/components/date/DateTime';
import {
  NoteIcon,
  OverrideIcon,
  TicketIcon,
  SolutionTypeSvgIcon,
} from 'web/components/icon';
import SolutionTypeIcon from 'web/components/icon/SolutionTypeIcon';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import Qod from 'web/components/qod/Qod';
import TableData from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import RowDetailsToggle from 'web/entities/RowDetailsToggle';
import withRowDetails from 'web/entities/withRowDetails';
import useGmp from 'web/hooks/useGmp';
import ResultDetails, {
  type ResultDetailsProps,
} from 'web/pages/results/ResultDetails';
import {renderPercentile, renderScore} from 'web/utils/severity';
import {type SortDirectionType} from 'web/utils/sort-direction';

interface HeaderProps {
  currentSortBy?: string;
  currentSortDir?: SortDirectionType;
  sort?: boolean;
  onSortChange?: (sortBy: string) => void;
}

interface RowProps {
  entity: Result;
  onToggleDetailsClick?: () => void;
}

const getColumns = (enableEPSS = false, onToggleDetailsClick?: () => void) => [
  {
    key: 'vulnerability',
    title: _('Vulnerability'),
    width: '40%',
    sortBy: 'vulnerability',
    render: (entity: Result) => {
      let shownName = isDefined(entity.name)
        ? entity.name
        : entity.information?.id;
      if (!isDefined(shownName)) {
        shownName = entity.id;
      }
      const hasActiveNotes =
        isDefined(entity.notes) && entity.notes.some(note => note.isActive());
      const hasActiveOverrides =
        isDefined(entity.overrides) &&
        entity.overrides.some(override => override.isActive());
      const hasTickets = entity.tickets.length > 0;

      return (
        <Layout align="space-between">
          <RowDetailsToggle name={entity.id} onClick={onToggleDetailsClick}>
            <span>{shownName}</span>
          </RowDetailsToggle>
          <IconDivider>
            {hasActiveNotes && (
              <NoteIcon title={_('There are notes for this result')} />
            )}
            {hasActiveOverrides && (
              <OverrideIcon title={_('There are overrides for this result')} />
            )}
            {hasTickets && (
              <TicketIcon title={_('There are tickets for this result')} />
            )}
          </IconDivider>
        </Layout>
      );
    },
  },
  {
    key: 'solution_type',
    title: _('Solution type'),
    width: '2%',
    sortBy: 'solution_type',
    align: 'center',
    renderHeader: () => <SolutionTypeSvgIcon title={_('Solution type')} />,
    render: (entity: Result) => {
      return (
        <>
          {isDefined((entity?.information as Nvt | undefined)?.solution) && (
            <SolutionTypeIcon
              type={(entity?.information as Nvt | undefined)?.solution?.type}
            />
          )}
        </>
      );
    },
  },
  {
    key: 'severity',
    title: _('Severity'),
    width: '8%',
    sortBy: 'severity',
    render: (entity: Result) => <SeverityBar severity={entity.severity} />,
  },
  {
    key: 'qod',
    title: _('QoD'),
    width: '3%',
    sortBy: 'qod',
    align: 'end',
    render: (entity: Result) => {
      return (
        <>{isDefined(entity.qod?.value) && <Qod value={entity.qod.value} />}</>
      );
    },
  },
  {
    key: 'image',
    title: _('Short Name'),
    width: '10%',
    sortBy: 'oci_image_short_name',
    headerGroup: _('OCI Image'),
    render: (entity: Result) => {
      const {host} = entity;
      const shortName = entity.ociImage?.short_name;
      const sha = host?.name;
      const displayName =
        isDefined(shortName) && shortName !== '' ? shortName : sha;
      const shortenedName = isDefined(displayName)
        ? shorten(displayName, 40)
        : '';

      return (
        <span title={isDefined(sha) ? sha : undefined}>
          {isDefined(host?.id) ? (
            <DetailsLink id={host.id} textOnly={false} type="host">
              {shortenedName}
            </DetailsLink>
          ) : (
            shortenedName
          )}
        </span>
      );
    },
  },
  {
    key: 'location',
    title: _('Path'),
    width: '9%',
    sortBy: 'oci_image_path',
    headerGroup: _('OCI Image'),
    render: (entity: Result) => {
      const path = entity.ociImage?.path;
      return <>{isDefined(path) && path !== '' ? path : entity.port}</>;
    },
  },
  {
    key: 'name',
    title: _('Name'),
    width: '10%',
    sortBy: 'oci_image_name',
    headerGroup: _('OCI Image'),
    render: (entity: Result) => {
      const ociImageName = entity.ociImage?.name;
      if (!isDefined(ociImageName)) {
        return null;
      }
      return <span title={ociImageName}>{ociImageName}</span>;
    },
  },
  ...(enableEPSS
    ? [
        {
          key: 'epss_score',
          title: _('Score'),
          width: '3%',
          sortBy: 'epss_score',
          headerGroup: _('EPSS'),
          render: (entity: Result) => {
            const epssScore = entity?.information?.epss?.maxEpss?.score;
            return renderScore(epssScore);
          },
        },
        {
          key: 'epss_percentile',
          title: _('Percentile'),
          width: '3%',
          sortBy: 'epss_percentile',
          headerGroup: _('EPSS'),
          render: (entity: Result) => {
            const epssPercentile =
              entity?.information?.epss?.maxEpss?.percentile;
            return renderPercentile(epssPercentile);
          },
        },
      ]
    : []),
  {
    key: 'created',
    title: _('Created'),
    width: '15%',
    sortBy: 'created',
    render: (entity: Result) => <DateTime date={entity.creationTime} />,
  },
];

const Header = ({
  currentSortBy,
  currentSortDir,
  sort = true,
  onSortChange,
}: HeaderProps) => {
  const gmp = useGmp();
  const enableEPSS = gmp.settings.enableEPSS;
  const columns = getColumns(enableEPSS);

  const hasEPSS = columns.some(col => col.headerGroup === _('EPSS'));
  const hasOCIImage = columns.some(col => col.headerGroup === _('OCI Image'));
  const hasNestedHeaders = hasEPSS || hasOCIImage;

  return (
    <TableHeader>
      <TableRow>
        {columns.map(column => {
          if (
            column.headerGroup ||
            (column.key === 'created' && hasNestedHeaders)
          ) {
            return null;
          }
          return (
            <TableHead
              key={column.key}
              align={column.align}
              currentSortBy={currentSortBy}
              currentSortDir={currentSortDir}
              rowSpan={hasNestedHeaders ? 2 : undefined}
              sortBy={sort ? column.sortBy : undefined}
              title={column.title}
              width={column.width}
              onSortChange={onSortChange}
            >
              {column.renderHeader?.()}
            </TableHead>
          );
        })}
        {hasOCIImage && <TableHead colSpan={3}>{_('OCI Image')}</TableHead>}
        {hasEPSS && <TableHead colSpan={2}>{_('EPSS')}</TableHead>}
        {hasNestedHeaders && (
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            rowSpan={2}
            sortBy={sort ? 'created' : undefined}
            title={_('Created')}
            width="15%"
            onSortChange={onSortChange}
          />
        )}
      </TableRow>
      {hasNestedHeaders && (
        <TableRow>
          {columns
            .filter(col => col.headerGroup === _('OCI Image'))
            .map(column => (
              <TableHead
                key={column.key}
                currentSortBy={currentSortBy}
                currentSortDir={currentSortDir}
                sortBy={sort ? column.sortBy : undefined}
                title={column.title}
                width={column.width}
                onSortChange={onSortChange}
              />
            ))}
          {columns
            .filter(col => col.headerGroup === _('EPSS'))
            .map(column => (
              <TableHead
                key={column.key}
                currentSortBy={currentSortBy}
                currentSortDir={currentSortDir}
                sortBy={sort ? column.sortBy : undefined}
                title={column.title}
                width={column.width}
                onSortChange={onSortChange}
              />
            ))}
        </TableRow>
      )}
    </TableHeader>
  );
};

const Row = ({entity, onToggleDetailsClick}: RowProps) => {
  const gmp = useGmp();
  const enableEPSS = gmp.settings.enableEPSS;
  const columns = getColumns(enableEPSS, onToggleDetailsClick);

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
  emptyTitle: _l('No results available'),
  row: Row,
  rowDetails: withRowDetails<Result, ResultDetailsProps>(
    'result',
    7,
  )(ResultDetails),
});
