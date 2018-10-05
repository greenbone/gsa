/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Seffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import PropTypes from 'web/utils/proptypes';
import {renderComponent} from 'web/utils/render';

import {withEntityRow, RowDetailsToggle} from 'web/entities/row';

import SeverityBar from 'web/components/bar/severitybar';

import Icon from 'web/components/icon/icon';
import SolutionTypeIcon from 'web/components/icon/solutiontypeicon';

import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';

import TableRow from 'web/components/table/row';
import TableData from 'web/components/table/data';

import ResultDelta from './delta';

const Row = ({
  actions,
  delta = false,
  entity,
  links = true,
  onToggleDetailsClick,
  ...other
}) => {
  const {host} = entity;
  const shown_name = isDefined(entity.name) ? entity.name : entity.nvt.oid;
  const has_tags = isDefined(entity.nvt) && isDefined(entity.nvt.tags);
  const hasActiveNotes =
    entity.notes.filter(note => note.isActive()).length > 0;
  const hasActiveOverrides =
    entity.overrides.filter(override => override.isActive()).length > 0;
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
                <Icon
                  img="new_note.svg"
                  title={_('There are notes for this result')}
                />
              }
              {hasActiveOverrides &&
                <Icon
                  img="new_override.svg"
                  title={_('There are overrides for this result')}
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
        {entity.qod.value} %
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
      {renderComponent(actions, {...other, entity})}
    </TableRow>
  );
};

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  delta: PropTypes.bool,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func,
};

export default withEntityRow()(Row);

// vim: set ts=2 sw=2 tw=80:
