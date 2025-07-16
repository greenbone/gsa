/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {typeName, getEntityType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import EntityLink from 'web/entity/Link';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {permissionDescription} from 'web/utils/Render';

const Actions = withEntitiesActions(
  ({
    entity,
    onPermissionDeleteClick,
    onPermissionDownloadClick,
    onPermissionCloneClick,
    onPermissionEditClick,
  }) => {
    const [_] = useTranslation();

    return (
      <IconDivider grow align={['center', 'center']}>
        <TrashIcon
          displayName={_('Permission')}
          entity={entity}
          name="permission"
          onClick={onPermissionDeleteClick}
        />
        <EditIcon
          displayName={_('Permission')}
          entity={entity}
          name="permission"
          onClick={onPermissionEditClick}
        />
        <CloneIcon
          displayName={_('Permission')}
          entity={entity}
          mayClone={entity.isWritable()}
          name="permission"
          title={_('Clone Permission')}
          value={entity}
          onClick={onPermissionCloneClick}
        />
        <ExportIcon
          title={_('Export Permission')}
          value={entity}
          onClick={onPermissionDownloadClick}
        />
      </IconDivider>
    );
  },
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onPermissionCloneClick: PropTypes.func.isRequired,
  onPermissionDeleteClick: PropTypes.func.isRequired,
  onPermissionDownloadClick: PropTypes.func.isRequired,
  onPermissionEditClick: PropTypes.func.isRequired,
};

const Row = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => {
  const [_] = useTranslation();

  return (
    <TableRow>
      <EntityNameTableData
        displayName={_('Permission')}
        entity={entity}
        link={links}
        type="permission"
        onToggleDetailsClick={onToggleDetailsClick}
      />
      <TableData>
        {permissionDescription(entity.name, entity.resource, entity.subject)}
      </TableData>
      <TableData>
        {isDefined(entity.resource) && typeName(getEntityType(entity.resource))}
      </TableData>
      <TableData>
        {isDefined(entity.resource) && (
          <span>
            <EntityLink entity={entity.resource} />
          </span>
        )}
      </TableData>
      <TableData>
        {isDefined(entity.subject) && typeName(getEntityType(entity.subject))}
      </TableData>
      <TableData>
        {isDefined(entity.subject) && (
          <span>
            <EntityLink entity={entity.subject} />
          </span>
        )}
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
