/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import IconDivider from 'web/components/layout/icondivider';

import ExportIcon from 'web/components/icon/exporticon';

import TableRow from 'web/components/table/row';

import EntityNameTableData from 'web/entities/entitynametabledata';
import withEntitiesActions from 'web/entities/withEntitiesActions';

import CloneIcon from 'web/entity/icon/cloneicon';
import TrashIcon from 'web/entity/icon/trashicon';
import EditIcon from 'web/entity/icon/editicon';

import PropTypes from 'web/utils/proptypes';

const Actions = withEntitiesActions(
  ({
    entity,
    onGroupEditClick,
    onGroupCloneClick,
    onGroupDeleteClick,
    onGroupDownloadClick,
  }) => (
    <IconDivider align={['center', 'center']} grow>
      <TrashIcon
        displayName={_('Group')}
        name="group"
        entity={entity}
        onClick={onGroupDeleteClick}
      />
      <EditIcon
        displayName={_('Group')}
        name="group"
        entity={entity}
        onClick={onGroupEditClick}
      />
      <CloneIcon
        displayName={_('Group')}
        name="user"
        entity={entity}
        title={_('Clone Group')}
        value={entity}
        onClick={onGroupCloneClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Group')}
        onClick={onGroupDownloadClick}
      />
    </IconDivider>
  ),
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onGroupCloneClick: PropTypes.func.isRequired,
  onGroupDeleteClick: PropTypes.func.isRequired,
  onGroupDownloadClick: PropTypes.func.isRequired,
  onGroupEditClick: PropTypes.func.isRequired,
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
      type="group"
      displayName={_('Group')}
      onToggleDetailsClick={onToggleDetailsClick}
    />
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
