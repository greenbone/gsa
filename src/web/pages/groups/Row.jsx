/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import useTranslation from 'src/web/hooks/useTranslation';
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
  (
    {
      entity,
      onGroupEditClick,
      onGroupCloneClick,
      onGroupDeleteClick,
      onGroupDownloadClick,
    }
  ) => {
    const [_] = useTranslation();

    return (
      <IconDivider grow align={['center', 'center']}>
        <TrashIcon
          displayName={_('Group')}
          entity={entity}
          name="group"
          onClick={onGroupDeleteClick}
        />
        <EditIcon
          displayName={_('Group')}
          entity={entity}
          name="group"
          onClick={onGroupEditClick}
        />
        <CloneIcon
          displayName={_('Group')}
          entity={entity}
          name="user"
          title={_('Clone Group')}
          value={entity}
          onClick={onGroupCloneClick}
        />
        <ExportIcon
          title={_('Export Group')}
          value={entity}
          onClick={onGroupDownloadClick}
        />
      </IconDivider>
    );
  },
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onGroupCloneClick: PropTypes.func.isRequired,
  onGroupDeleteClick: PropTypes.func.isRequired,
  onGroupDownloadClick: PropTypes.func.isRequired,
  onGroupEditClick: PropTypes.func.isRequired,
};

const Row = (
  {
    actionsComponent: ActionsComponent = Actions,
    entity,
    links = true,
    onToggleDetailsClick,
    ...props
  }
) => {
  const [_] = useTranslation();

  return (
    <TableRow>
      <EntityNameTableData
        displayName={_('Group')}
        entity={entity}
        link={links}
        type="group"
        onToggleDetailsClick={onToggleDetailsClick}
      />
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
