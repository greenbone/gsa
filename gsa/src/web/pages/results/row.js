/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import _ from 'gmp/locale';

import {longDate} from 'gmp/locale/date';

import {isDefined} from 'gmp/utils/identity';

import {shorten} from 'gmp/utils/string';

import SeverityBar from 'web/components/bar/severitybar';

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
  const shown_name = isDefined(entity.name) ? entity.name : entity.nvt.oid;
  const has_tags = isDefined(entity.nvt) && isDefined(entity.nvt.tags);
  const hasActiveNotes =
    entity.notes.filter(note => note.isActive()).length > 0;
  const hasActiveOverrides =
    entity.overrides.filter(override => override.isActive()).length > 0;
  const hasTickets = entity.tickets.length > 0;
  return (
    <TableRow>
      {delta &&
        <TableData align={['center', 'center']}>
          {entity.hasDelta() &&
            <ResultDelta
              delta={entity.delta}
            />
          }
        </TableData>
      }
      <TableData>
        <RowDetailsToggle
          name={entity.id}
          onClick={onToggleDetailsClick}
        >
          <Layout align="space-between">
            <span>
              {shown_name}
            </span>
            <IconDivider>
              {hasActiveNotes &&
                <NoteIcon
                  title={_('There are notes for this result')}
                />
              }
              {hasActiveOverrides &&
                <OverrideIcon
                  title={_('There are overrides for this result')}
                />
              }
              {hasTickets &&
                <TicketIcon
                  title={_('There are tickets for this result')}
                />
              }
            </IconDivider>
          </Layout>
        </RowDetailsToggle>
      </TableData>
      <TableData>
        {has_tags &&
          <SolutionTypeIcon type={entity.nvt.tags.solution_type}/>
        }
      </TableData>
      <TableData>
        <SeverityBar severity={entity.severity}/>
      </TableData>
      <TableData align="end">
        <Qod value={entity.qod.value}/>
      </TableData>
      <TableData>
        <DetailsLink
          type="host"
          id={host.id}
          textOnly={!links}
        >
          {host.name}
        </DetailsLink>
      </TableData>
      <TableData>
        {host.hostname.length > 0 &&
          <span title={host.hostname}>
            ({shorten(host.hostname, 40)})
          </span>
         }
      </TableData>
      <TableData>
        {entity.port}
      </TableData>
      <TableData>
        {longDate(entity.modificationTime)}
      </TableData>
      <ActionsComponent
        {...props}
        entity={entity}
      />
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
