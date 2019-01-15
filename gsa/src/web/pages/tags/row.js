/* Copyright (C) 2017-2018 Greenbone Networks GmbH
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
import {shortDate} from 'gmp/locale/date';

import {typeName} from 'gmp/utils/entitytype';

import PropTypes from 'web/utils/proptypes';
import {
  renderComponent,
  renderYesNo,
} from 'web/utils/render';
import withCapabilities from 'web/utils/withCapabilities';

import EntityNameTableData from 'web/entities/entitynametabledata';
import {withEntityActions} from 'web/entities/actions';
import {withEntityRow} from 'web/entities/row';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import ExportIcon from 'web/components/icon/exporticon';
import Icon from 'web/components/icon/icon';

import IconDivider from 'web/components/layout/icondivider';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

const Actions = withCapabilities(({
  capabilities,
  entity,
  onTagCloneClick,
  onTagDeleteClick,
  onTagDownloadClick,
  onTagEditClick,
  onTagDisableClick,
  onTagEnableClick,
}) => {
  let endisableable = null;

  if (capabilities.mayEdit('tag')) {
    if (entity.isActive()) {
      endisableable = (
        <Icon
          img="disable.svg"
          value={entity}
          title={_('Disable Tag')}
          onClick={onTagDisableClick}
        />
      );
    }
    else {
      endisableable = (
        <Icon
          img="enable.svg"
          value={entity}
          title={_('Enable Tag')}
          onClick={onTagEnableClick}
        />
      );
    }
  }
  return (
    <IconDivider
      align={['center', 'center']}
      grow
    >
      {endisableable}
      <TrashIcon
        displayName={_('Tag')}
        name="tag"
        entity={entity}
        onClick={onTagDeleteClick}
      />
      <EditIcon
        displayName={_('Tag')}
        name="tag"
        entity={entity}
        onClick={onTagEditClick}
      />
      <CloneIcon
        displayName={_('Tag')}
        name="tag"
        entity={entity}
        title={_('Clone Tag')}
        value={entity}
        onClick={onTagCloneClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Tag')}
        onClick={onTagDownloadClick}
      />
    </IconDivider>
  );
});

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onTagCloneClick: PropTypes.func.isRequired,
  onTagDeleteClick: PropTypes.func.isRequired,
  onTagDisableClick: PropTypes.func.isRequired,
  onTagDownloadClick: PropTypes.func.isRequired,
  onTagEditClick: PropTypes.func.isRequired,
  onTagEnableClick: PropTypes.func.isRequired,
};

const Row = ({
    actions,
    entity,
    links = true,
    onToggleDetailsClick,
    ...props
  }, {
    capabilities,
  }) => {
  const {resourceCount, resourceType} = entity;
  return (
    <TableRow>
      <EntityNameTableData
        entity={entity}
        link={links}
        type="tag"
        displayName={_('Tag')}
        onToggleDetailsClick={onToggleDetailsClick}
      />
      <TableData>
        {entity.value}
      </TableData>
      <TableData>
        {renderYesNo(entity.isActive())}
      </TableData>
      <TableData>
        {typeName(resourceType)}
      </TableData>
      <TableData>
        {resourceCount}
      </TableData>
      <TableData>
        {shortDate(entity.modificationTime)}
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

Row.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default withEntityRow(withEntityActions(Actions))(Row);

// vim: set ts=2 sw=2 tw=80:
