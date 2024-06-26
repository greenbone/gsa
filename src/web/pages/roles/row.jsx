/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import ExportIcon from 'web/components/icon/exporticon';

import IconDivider from 'web/components/layout/icondivider';

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
    onRoleCloneClick,
    onRoleDeleteClick,
    onRoleDownloadClick,
    onRoleEditClick,
  }) => (
    <IconDivider align={['center', 'center']} grow>
      <TrashIcon
        displayName={_('Role')}
        name="role"
        entity={entity}
        onClick={onRoleDeleteClick}
      />
      <EditIcon
        displayName={_('Role')}
        name="role"
        entity={entity}
        onClick={onRoleEditClick}
      />
      <CloneIcon
        displayName={_('Role')}
        name="role"
        entity={entity}
        title={_('Clone Role')}
        value={entity}
        onClick={onRoleCloneClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Role')}
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
      entity={entity}
      link={links}
      type="role"
      displayName={_('Role')}
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
