/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined, isNumber} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import React from 'react';
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
import TableData from 'web/components/table/Data';
import TableRow from 'web/components/table/Row';
import EntitiesActions from 'web/entities/Actions';
import RowDetailsToggle from 'web/entities/RowDetailsToggle';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import ResultDelta from 'web/pages/results/Delta';
import PropTypes from 'web/utils/PropTypes';
const Row = ({
  actionsComponent: ActionsComponent = EntitiesActions,
  audit = false,
  delta = false,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => {
  const [_] = useTranslation();
  const {host} = entity;
  let shownName = isDefined(entity.name) ? entity.name : entity.information.id;
  if (!isDefined(shownName)) {
    shownName = entity.id;
  }
  const hasActiveNotes =
    entity.notes.filter(note => note.isActive()).length > 0;
  const hasActiveOverrides =
    entity.overrides.filter(override => override.isActive()).length > 0;
  const hasTickets = entity.tickets.length > 0;
  const deltaSeverity = entity.delta?.result?.severity;
  const deltaCompliance = entity.delta?.result?.compliance;
  const deltaHostname = entity.delta?.result?.host?.hostname;
  const deltaQoD = entity.delta?.result?.qod?.value;
  const epssScore = entity?.information?.epss?.max_severity?.score;
  const epssPercentile = entity?.information?.epss?.max_severity?.percentile;
  const gmp = useGmp();
  return (
    <TableRow>
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
        {isDefined(entity?.information?.solution) && (
          <SolutionTypeIcon type={entity.information.solution.type} />
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
          <Qod value={entity.qod.value} />
          {isDefined(deltaQoD) && entity.qod.value !== deltaQoD && (
            <DeltaDifferenceIcon
              title={_('QoD is changed from {{deltaQoD}}.', {deltaQoD})}
            />
          )}
        </IconDivider>
      </TableData>
      <TableData>
        <span>
          {isDefined(host.id) ? (
            <DetailsLink id={host.id} textOnly={!links} type="host">
              {host.name}
            </DetailsLink>
          ) : (
            host.name
          )}
        </span>
      </TableData>
      <TableData>
        <IconDivider>
          {host.hostname.length > 0 && (
            <span title={host.hostname}>{shorten(host.hostname, 40)}</span>
          )}
          {isDefined(deltaHostname) &&
            deltaHostname.length > 0 &&
            host.hostname !== deltaHostname && (
              <DeltaDifferenceIcon
                title={_('Hostname is changed from {{deltaHostname}}.', {
                  deltaHostname,
                })}
              />
            )}
        </IconDivider>
      </TableData>
      <TableData>{entity.port}</TableData>
      {gmp.settings.enableEPSS && !audit && (
        <>
          <TableData>
            {isNumber(epssScore) ? epssScore.toFixed(5) : _('N/A')}
          </TableData>
          <TableData>
            {isNumber(epssPercentile)
              ? `${(epssPercentile * 100).toFixed(3)}%`
              : _('N/A')}
          </TableData>
        </>
      )}
      <TableData>
        <DateTime date={entity.creationTime} />
      </TableData>
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

Row.propTypes = {
  actionsComponent: PropTypes.component,
  audit: PropTypes.bool,
  delta: PropTypes.bool,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func,
};

export default Row;
