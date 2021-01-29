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

import SeverityBar from 'web/components/bar/severitybar';

import Comment from 'web/components/comment/comment';

import DateTime from 'web/components/date/datetime';

import ExportIcon from 'web/components/icon/exporticon';
import NewIcon from 'web/components/icon/newicon';
import OsIcon from 'web/components/icon/osicon';

import IconDivider from 'web/components/layout/icondivider';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import DeleteIcon from 'web/entity/icon/deleteicon';
import EditIcon from 'web/entity/icon/editicon';

import {RowDetailsToggle} from 'web/entities/row';
import withEntitiesActions from 'web/entities/withEntitiesActions';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

const Actions = compose(
  withCapabilities,
  withEntitiesActions,
)(
  ({
    capabilities,
    entity,
    onTargetCreateFromHostClick,
    onHostEditClick,
    onHostDeleteClick,
    onHostDownloadClick,
  }) => {
    let new_title;
    const can_create_target = capabilities.mayCreate('target');
    if (can_create_target) {
      new_title = _('Create Target from Host');
    } else {
      new_title = _('Permission to create Target denied');
    }
    return (
      <IconDivider align={['center', 'center']} grow>
        <DeleteIcon
          entity={entity}
          name="asset"
          displayName={_('Host')}
          onClick={onHostDeleteClick}
        />
        <EditIcon
          entity={entity}
          name="asset"
          displayName={_('Host')}
          onClick={onHostEditClick}
        />
        <NewIcon
          value={entity}
          active={can_create_target}
          title={new_title}
          onClick={onTargetCreateFromHostClick}
        />
        <ExportIcon
          value={entity}
          title={_('Export Host')}
          onClick={onHostDownloadClick}
        />
      </IconDivider>
    );
  },
);

Actions.propTypes = {
  entity: PropTypes.model,
  onHostDeleteClick: PropTypes.func,
  onHostDownloadClick: PropTypes.func,
  onHostEditClick: PropTypes.func,
  onTargetCreateFromHostClick: PropTypes.func,
};

const Row = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => {
  const {details = {}, os} = entity;
  const os_cpe = os;
  const os_txt = isDefined(details.best_os_txt)
    ? details.best_os_txt.value
    : undefined;
  return (
    <TableRow>
      <TableData flex="column">
        <span>
          <RowDetailsToggle name={entity.id} onClick={onToggleDetailsClick}>
            {entity.name}
          </RowDetailsToggle>
        </span>
        <Comment text={entity.comment} />
      </TableData>
      <TableData>{entity.hostname}</TableData>
      <TableData>{entity.ip}</TableData>
      <TableData>
        <OsIcon osCpe={os_cpe} osTxt={os_txt} />
      </TableData>
      <TableData>
        <SeverityBar severity={entity.severity} />
      </TableData>
      <TableData>
        <DateTime date={entity.modificationTime} />
      </TableData>
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

Row.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default Row;

// vim: set ts=2 sw=2 tw=80:
