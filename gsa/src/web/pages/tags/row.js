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

import {typeName} from 'gmp/utils/entitytype';

import DateTime from 'web/components/date/datetime';

import DisableIcon from 'web/components/icon/disableicon';
import EnableIcon from 'web/components/icon/enableicon';
import ExportIcon from 'web/components/icon/exporticon';

import IconDivider from 'web/components/layout/icondivider';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import EntityNameTableData from 'web/entities/entitynametabledata';
import withEntitiesActions from 'web/entities/withEntitiesActions';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import {renderYesNo} from 'web/utils/render';
import withCapabilities from 'web/utils/withCapabilities';

const Actions = compose(
  withCapabilities,
  withEntitiesActions,
)(
  ({
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
          <DisableIcon
            value={entity}
            title={_('Disable Tag')}
            onClick={onTagDisableClick}
          />
        );
      } else {
        endisableable = (
          <EnableIcon
            value={entity}
            title={_('Enable Tag')}
            onClick={onTagEnableClick}
          />
        );
      }
    }
    return (
      <IconDivider align={['center', 'center']} grow>
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
  },
);

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
  actionsComponent: ActionsComponent = Actions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
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
      <TableData>{entity.value}</TableData>
      <TableData>{renderYesNo(entity.isActive())}</TableData>
      <TableData>{typeName(resourceType)}</TableData>
      <TableData>{resourceCount}</TableData>
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
