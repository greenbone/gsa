/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {typeName} from 'gmp/utils/entitytype';
import React from 'react';
import useTranslation from 'src/web/hooks/useTranslation';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import TableData from 'web/components/table/Data';
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
      onFilterDeleteClick,
      onFilterDownloadClick,
      onFilterCloneClick,
      onFilterEditClick,
    }
  ) => {
    const [_] = useTranslation();

    return (
      <IconDivider grow align={['center', 'center']}>
        <TrashIcon
          displayName={_('Filter')}
          entity={entity}
          name="filter"
          onClick={onFilterDeleteClick}
        />
        <EditIcon
          displayName={_('Filter')}
          entity={entity}
          name="filter"
          onClick={onFilterEditClick}
        />
        <CloneIcon
          displayName={_('Filter')}
          entity={entity}
          name="filter"
          title={_('Clone Filter')}
          value={entity}
          onClick={onFilterCloneClick}
        />
        <ExportIcon
          title={_('Export Filter')}
          value={entity}
          onClick={onFilterDownloadClick}
        />
      </IconDivider>
    );
  },
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onFilterCloneClick: PropTypes.func.isRequired,
  onFilterDeleteClick: PropTypes.func.isRequired,
  onFilterDownloadClick: PropTypes.func.isRequired,
  onFilterEditClick: PropTypes.func.isRequired,
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
        displayName={_('Filter')}
        entity={entity}
        link={links}
        type="filter"
        onToggleDetailsClick={onToggleDetailsClick}
      />
      <TableData>{entity.toFilterString()}</TableData>
      <TableData>{typeName(entity.filter_type)}</TableData>
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
