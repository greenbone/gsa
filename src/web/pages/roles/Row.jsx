/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import TableRow from 'web/components/table/Row';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import PropTypes from 'web/utils/PropTypes';

const Actions = withEntitiesActions(
  ({
    entity,
    onRoleCloneClick,
    onRoleDeleteClick,
    onRoleDownloadClick,
    onRoleEditClick,
  }) => (
    <IconDivider grow align={['center', 'center']}>
      <TrashIcon
        displayName={_('Role')}
        entity={entity}
        name="role"
        onClick={onRoleDeleteClick}
      />
      <EditIcon
        displayName={_('Role')}
        entity={entity}
        name="role"
        onClick={onRoleEditClick}
      />
      <CloneIcon
        displayName={_('Role')}
        entity={entity}
        name="role"
        title={_('Clone Role')}
        value={entity}
        onClick={onRoleCloneClick}
      />
      <ExportIcon
        title={_('Export Role')}
        value={entity}
        onClick={onRoleDownloadClick}
      />
    </IconDivider>
  ),
);

Actions.propTypes = {
  entity: PropTypes.model,
  onRoleCloneClick: PropTypes.func,
  onRoleDeleteClick: PropTypes.func,
  onRoleDownloadClick: PropTypes.func,
  onRoleEditClick: PropTypes.func,
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
      displayName={_('Role')}
      entity={entity}
      link={links}
      type="role"
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
