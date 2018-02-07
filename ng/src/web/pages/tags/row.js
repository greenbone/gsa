/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import _, {short_date} from 'gmp/locale.js';
import {is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';
import {
  render_component,
  render_yesno,
  type_name,
  N_A,
} from '../../utils/render.js';
import withCapabilities from '../../utils/withCapabilities.js';

import EntityNameTableData from '../../entities/entitynametabledata.js';
import EntityLink from '../../entity/link.js';
import {withEntityActions} from '../../entities/actions.js';
import {withEntityRow} from '../../entities/row.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import ExportIcon from '../../components/icon/exporticon.js';
import Icon from '../../components/icon/icon.js';

import IconDivider from '../../components/layout/icondivider.js';

import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

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
        onClick={onTagDeleteClick}/>
      <EditIcon
        displayName={_('Tag')}
        name="tag"
        entity={entity}
        onClick={onTagEditClick}/>
      <CloneIcon
        displayName={_('Tag')}
        name="tag"
        entity={entity}
        title={_('Clone Tag')}
        value={entity}
        onClick={onTagCloneClick}/>
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
        {render_yesno(entity.isActive())}
      </TableData>
      <TableData>
        {is_defined(entity.resource) && type_name(entity.resource.entity_type)}
      </TableData>
      <TableData>
        {is_defined(entity.resource) && (
          entity.isOrphan() ?
            <span>{N_A}{' '}
              <i>({entity.resource.id})</i>
            </span> :
            <EntityLink entity={entity.resource}/>
        )}
      </TableData>
      <TableData>
        {short_date(entity.modified)}
      </TableData>
      {render_component(actions, {...props, entity})}
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
