/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Nvt from 'gmp/models/nvt';
import Result from 'gmp/models/result';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import ComplianceBar from 'web/components/bar/ComplianceBar';
import SeverityBar from 'web/components/bar/SeverityBar';
import DateTime from 'web/components/date/DateTime';
import {
  DeltaDifferenceIcon,
  NoteIcon,
  OverrideIcon,
  TicketIcon,
} from 'web/components/icon';
import SolutionTypeIcon from 'web/components/icon/SolutionTypeIcon';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import Qod from 'web/components/qod/Qod';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import EntitiesActions, {
  EntitiesActionsProps,
} from 'web/entities/EntitiesActions';
import RowDetailsToggle from 'web/entities/RowDetailsToggle';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import ResultDelta from 'web/pages/results/ResultDelta';
import {renderPercentile, renderScore} from 'web/utils/severity';

export interface ResultTableRowProps extends EntitiesActionsProps<Result> {
  actionsComponent?: React.ComponentType<EntitiesActionsProps<Result>>;
  audit?: boolean;
  delta?: boolean;
  entity: Result;
  links?: boolean;
  onToggleDetailsClick?: () => void;
}

const ResultTableRow = ({
  actionsComponent: ActionsComponent = EntitiesActions,
  audit = false,
  'data-testid': dataTestId = 'result-table-row',
  delta = false,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}: ResultTableRowProps) => {
  const [_] = useTranslation();
  const {host} = entity;
  let shownName = isDefined(entity.name) ? entity.name : entity.information?.id;
  if (!isDefined(shownName)) {
    shownName = entity.id;
  }
  const hasActiveNotes =
    isDefined(entity.notes) &&
    entity.notes.filter(note => note.isActive()).length > 0;
  const hasActiveOverrides =
    isDefined(entity.overrides) &&
    entity.overrides.filter(override => override.isActive()).length > 0;
  const hasTickets = entity.tickets.length > 0;
  const deltaSeverity = entity.delta?.result?.severity;
  const deltaCompliance = entity.delta?.result?.compliance;
  const deltaHostname = entity.delta?.result?.host?.hostname;
  const deltaQoD = entity.delta?.result?.qod?.value;
  const epssScore = entity?.information?.epss?.maxEpss?.score;
  const epssPercentile = entity?.information?.epss?.maxEpss?.percentile;
  const gmp = useGmp();
  const enableEPSS = gmp.settings.enableEPSS;
  return (
    <TableRow data-testid={dataTestId}>
      {delta && (
        <TableData align={['center', 'center']}>
          {entity.hasDelta() && <ResultDelta delta={entity.delta} />}
        </TableData>
      )}
      <TableData>
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
      </TableData>
      <TableData>
        {isDefined((entity?.information as Nvt | undefined)?.solution) && (
          <SolutionTypeIcon
            type={(entity?.information as Nvt | undefined)?.solution?.type}
          />
        )}
      </TableData>
      <TableData>
        {audit ? (
          <IconDivider>
            <ComplianceBar compliance={entity.compliance} />
            {isDefined(deltaCompliance) &&
              entity.compliance !== deltaCompliance && (
                <DeltaDifferenceIcon
                  title={_('Compliance is changed from {{deltaCompliance}}.', {
                    deltaCompliance,
                  })}
                />
              )}
          </IconDivider>
        ) : (
          <IconDivider>
            {<SeverityBar severity={entity.severity} />}
            {isDefined(deltaSeverity) && entity.severity !== deltaSeverity && (
              <DeltaDifferenceIcon
                title={_('Severity is changed from {{deltaSeverity}}.', {
                  deltaSeverity,
                })}
              />
            )}
          </IconDivider>
        )}
      </TableData>
      <TableData align="end">
        <IconDivider>
          {isDefined(entity.qod?.value) && <Qod value={entity.qod.value} />}
          {isDefined(deltaQoD) && entity.qod?.value !== deltaQoD && (
            <DeltaDifferenceIcon
              title={_('QoD is changed from {{deltaQoD}}.', {deltaQoD})}
            />
          )}
        </IconDivider>
      </TableData>
      <TableData>
        <span>
          {isDefined(host?.id) ? (
            <DetailsLink id={host.id} textOnly={!links} type="host">
              {host.name}
            </DetailsLink>
          ) : (
            host?.name
          )}
        </span>
      </TableData>
      <TableData>
        <IconDivider>
          {isDefined(host?.hostname) && (
            <span title={host.hostname}>{shorten(host.hostname, 40)}</span>
          )}
          {isDefined(deltaHostname) &&
            deltaHostname.length > 0 &&
            host?.hostname !== deltaHostname && (
              <DeltaDifferenceIcon
                title={_('Hostname is changed from {{deltaHostname}}.', {
                  deltaHostname,
                })}
              />
            )}
        </IconDivider>
      </TableData>
      <TableData>{entity.port}</TableData>
      {enableEPSS && !audit && (
        <>
          <TableData>{renderScore(epssScore)}</TableData>
          <TableData>{renderPercentile(epssPercentile)}</TableData>
        </>
      )}
      <TableData>
        <DateTime date={entity.creationTime} />
      </TableData>
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

export default ResultTableRow;
