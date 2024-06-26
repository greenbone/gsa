/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import _ from 'gmp/locale';

import {typeName} from 'gmp/utils/entitytype';

import IconDivider from 'web/components/layout/icondivider';

import ExportIcon from 'web/components/icon/exporticon';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import EntityNameTableData from 'web/entities/entitynametabledata';
import withEntitiesActions from 'web/entities/withEntitiesActions';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import PropTypes from 'web/utils/proptypes';

const Actions = withEntitiesActions(
  ({
    entity,
    onFilterDeleteClick,
    onFilterDownloadClick,
    onFilterCloneClick,
    onFilterEditClick,
  }) => (
    <IconDivider grow align={['center', 'center']}>
      <TrashIcon
        displayName={_('Filter')}
        name="filter"
        entity={entity}
        onClick={onFilterDeleteClick}
      />
      <EditIcon
        displayName={_('Filter')}
        name="filter"
        entity={entity}
        onClick={onFilterEditClick}
      />
      <CloneIcon
        displayName={_('Filter')}
        name="filter"
        entity={entity}
        title={_('Clone Filter')}
        value={entity}
        onClick={onFilterCloneClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Filter')}
        onClick={onFilterDownloadClick}
      />
    </IconDivider>
  ),
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onFilterCloneClick: PropTypes.func.isRequired,
  onFilterDeleteClick: PropTypes.func.isRequired,
  onFilterDownloadClick: PropTypes.func.isRequired,
  onFilterEditClick: PropTypes.func.isRequired,
};

const Row = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => (
  <TableRow>
    <EntityNameTableData
      entity={entity}
      link={links}
      type="filter"
      displayName={_('Filter')}
      onToggleDetailsClick={onToggleDetailsClick}
    />
    <TableData>{entity.toFilterString()}</TableData>
    <TableData>{typeName(entity.filter_type)}</TableData>
    <ActionsComponent {...props} entity={entity} />
  </TableRow>
);

Row.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default Row;

// vim: set ts=2 sw=2 tw=80:
