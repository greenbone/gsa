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

import SeverityBar from 'web/components/bar/severitybar';

import DateTime from 'web/components/date/datetime';

import CpeIcon from 'web/components/icon/cpeicon';
import DeleteIcon from 'web/components/icon/deleteicon';
import ExportIcon from 'web/components/icon/exporticon';

import IconDivider from 'web/components/layout/icondivider';

import DetailsLink from 'web/components/link/detailslink';
import Link from 'web/components/link/link';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import withEntitiesActions from 'web/entities/withEntitiesActions';

import PropTypes from 'web/utils/proptypes';

const Actions = withEntitiesActions(
  ({entity, onOsDeleteClick, onOsDownloadClick}) => (
    <IconDivider align={['center', 'center']} grow>
      {entity.isInUse() ? (
        <DeleteIcon active={false} title={_('Operating System is in use')} />
      ) : (
        <DeleteIcon
          value={entity}
          title={_('Delete')}
          onClick={onOsDeleteClick}
        />
      )}
      <ExportIcon
        value={entity}
        onClick={onOsDownloadClick}
        title={_('Export Operating System')}
      />
    </IconDivider>
  ),
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onOsDeleteClick: PropTypes.func.isRequired,
  onOsDownloadClick: PropTypes.func.isRequired,
};

const Row = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  links = true,
  ...props
}) => (
  <TableRow>
    <TableData>
      <IconDivider align={['start', 'center']}>
        <CpeIcon name={entity.name} />
        <DetailsLink type={entity.entityType} id={entity.id} textOnly={!links}>
          {entity.name}
        </DetailsLink>
      </IconDivider>
    </TableData>
    <TableData>{entity.title}</TableData>
    <TableData>
      <SeverityBar severity={entity.latest_severity} />
    </TableData>
    <TableData>
      <SeverityBar severity={entity.highest_severity} />
    </TableData>
    <TableData>
      <SeverityBar severity={entity.average_severity} />
    </TableData>
    <TableData>
      <span>
        <Link
          to={'hosts'}
          filter={'os~"' + entity.name + '"'}
          textOnly={!links}
        >
          {entity.hosts.length}
        </Link>
      </span>
    </TableData>
    <TableData>
      <DateTime date={entity.modificationTime} />
    </TableData>
    <ActionsComponent {...props} entity={entity} />
  </TableRow>
);

Row.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default Row;

// vim: set ts=2 sw=2 tw=80:
