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

import {isDefined} from 'gmp/utils/identity';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import {renderComponent} from 'web/utils/render';
import withCapabilities from 'web/utils/withCapabilities';

import EditIcon from 'web/entity/icon/editicon';
import DeleteIcon from 'web/entity/icon/deleteicon';
import {withEntityActions} from 'web/entities/actions';
import {withEntityRow, RowDetailsToggle} from 'web/entities/row';

import SeverityBar from 'web/components/bar/severitybar';

import Comment from 'web/components/comment/comment';

import ExportIcon from 'web/components/icon/exporticon';
import NewIcon from 'web/components/icon/newicon';
import OsIcon from 'web/components/icon/osicon';

import IconDivider from 'web/components/layout/icondivider';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

const Actions = ({
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
  }
  else {
    new_title = _('Permission to create Target denied');
  }
  return (
    <IconDivider
      align={['center', 'center']}
      grow
    >
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
};

Actions.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  entity: PropTypes.model,
  onHostDeleteClick: PropTypes.func,
  onHostDownloadClick: PropTypes.func,
  onHostEditClick: PropTypes.func,
  onTargetCreateFromHostClick: PropTypes.func,
};

const Row = ({
  entity,
  links = true,
  actions,
  onToggleDetailsClick,
  ...props
}) => {
  const {details = {}} = entity;
  const os_cpe = isDefined(details.best_os_cpe) ? details.best_os_cpe.value :
    undefined;
  const os_txt = isDefined(details.best_os_txt) ? details.best_os_txt.value :
    undefined;
  return (
    <TableRow>
      <TableData flex="column">
        <RowDetailsToggle
          name={entity.id}
          onClick={onToggleDetailsClick}
        >
          {entity.name}
        </RowDetailsToggle>
        <Comment text={entity.comment}/>
      </TableData>
      <TableData>
        {entity.hostname}
      </TableData>
      <TableData>
        {entity.ip}
      </TableData>
      <TableData>
        <OsIcon
          osCpe={os_cpe}
          osTxt={os_txt}
        />
      </TableData>
      <TableData>
        <SeverityBar severity={entity.severity}/>
      </TableData>
      <TableData>
        {isDefined(entity.modificationTime) &&
          longDate(entity.modificationTime)
        }
      </TableData>
      {renderComponent(actions, {...props, entity})}
    </TableRow>
  );
};

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default compose(
  withEntityRow(withEntityActions(Actions)),
  withCapabilities,
)(Row);

// vim: set ts=2 sw=2 tw=80:
