/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import {shorten} from 'gmp/utils/string';

import SeverityBar from 'web/components/bar/severitybar';

import DateTime from 'web/components/date/datetime';

import NoteIcon from 'web/components/icon/noteicon';
import OverrideIcon from 'web/components/icon/overrideicon';
import SolutionTypeIcon from 'web/components/icon/solutiontypeicon';
import TicketIcon from 'web/components/icon/ticketicon';

import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';

import TableRow from 'web/components/table/row';
import TableData from 'web/components/table/data';

import Qod from 'web/components/qod/qod';

import {RowDetailsToggle} from 'web/entities/row';
import EntitiesActions from 'web/entities/actions';

import PropTypes from 'web/utils/proptypes';

import ResultDelta from './delta';

const Row = ({
  actionsComponent: ActionsComponent = EntitiesActions,
  delta = false,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => {
  const {host} = entity;
  let shownName = isDefined(entity.name) ? entity.name : entity.nvt.oid;
  if (!isDefined(shownName)) {
    shownName = entity.id;
  }
  const hasActiveNotes =
    entity.notes.filter(note => note.isActive()).length > 0;
  const hasActiveOverrides =
    entity.overrides.filter(override => override.isActive()).length > 0;
  const hasTickets = entity.tickets.length > 0;
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
        {isDefined(entity?.nvt?.solution) && (
          <SolutionTypeIcon type={entity.nvt.solution.type} />
        )}
      </TableData>
      <TableData>
        <SeverityBar severity={entity.severity} />
      </TableData>
      <TableData align="end">
        <Qod value={entity.qod.value} />
      </TableData>
      <TableData>
        <span>
          {isDefined(host.id) ? (
            <DetailsLink type="host" id={host.id} textOnly={!links}>
              {host.name}
            </DetailsLink>
          ) : (
            host.name
          )}
        </span>
      </TableData>
      <TableData>
        {host.hostname.length > 0 && (
          <span title={host.hostname}>{shorten(host.hostname, 40)}</span>
        )}
      </TableData>
      <TableData>{entity.port}</TableData>
      <TableData>
        <DateTime date={entity.creationTime} />
      </TableData>
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

Row.propTypes = {
  actionsComponent: PropTypes.component,
  delta: PropTypes.bool,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func,
};

export default Row;

// vim: set ts=2 sw=2 tw=80:
