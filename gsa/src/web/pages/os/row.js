/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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

import PropTypes from '../../utils/proptypes.js';
import {renderComponent} from '../../utils/render.js';

import {withEntityActions} from '../../entities/actions.js';
import {withEntityRow} from '../../entities/row.js';

import SeverityBar from '../../components/bar/severitybar.js';

import CpeIcon from '../../components/icon/cpeicon.js';
import DeleteIcon from '../../components/icon/deleteicon.js';
import ExportIcon from '../../components/icon/exporticon.js';

import IconDivider from '../../components/layout/icondivider.js';

import DetailsLink from '../../components/link/detailslink.js';
import Link from '../../components/link/link.js';

import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

const IconActions = ({
  entity,
  onOsDeleteClick,
  onOsDownloadClick,
}) => (
  <IconDivider
    align={['center', 'center']}
    grow
  >
    {entity.isInUse() ?
      <DeleteIcon
        active={false}
        title={_('Operating System is in use')}
      /> :
      <DeleteIcon
        value={entity}
        title={_('Delete')}
        onClick={onOsDeleteClick}
      />
    }
    <ExportIcon
      value={entity}
      onClick={onOsDownloadClick}
      title={_('Export Operating System')}
    />
  </IconDivider>
);

IconActions.propTypes = {
  entity: PropTypes.model.isRequired,
  onOsDeleteClick: PropTypes.func.isRequired,
  onOsDownloadClick: PropTypes.func.isRequired,
};

const Actions = withEntityActions(IconActions);

const Row = ({entity, links = true, actions, ...props}) => {
  return (
    <TableRow>
      <TableData>
        <IconDivider flex align={['start', 'center']}>
          <CpeIcon name={entity.name}/>
          <DetailsLink
            type="os"
            id={entity.id}
            textOnly={!links}
          >
            {entity.name}
          </DetailsLink>
        </IconDivider>
      </TableData>
      <TableData>
        {entity.title}
      </TableData>
      <TableData flex align="center">
        <SeverityBar severity={entity.latest_severity}/>
      </TableData>
      <TableData flex align="center">
        <SeverityBar severity={entity.highest_severity}/>
      </TableData>
      <TableData flex align="center">
        <SeverityBar severity={entity.average_severity}/>
      </TableData>
      <TableData flex align="center">
        <Link
          to={'hosts'}
          filter={'os~"' + entity.name + '"'}
          textOnly={!links}
        >
          {entity.hosts.length}
        </Link>
      </TableData>
      <TableData>
        {longDate(entity.modificationTime)}
      </TableData>
      {renderComponent(actions, {...props, entity})}
    </TableRow>
  );
};

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default withEntityRow(Actions)(Row);

// vim: set ts=2 sw=2 tw=80:
