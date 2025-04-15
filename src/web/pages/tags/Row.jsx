/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {typeName} from 'gmp/utils/entitytype';
import React from 'react';
import useTranslation from 'src/web/hooks/useTranslation';
import DateTime from 'web/components/date/DateTime';
import {DisableIcon, EnableIcon} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import TableData from 'web/components/table/Data';
import TableRow from 'web/components/table/Row';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import {renderYesNo} from 'web/utils/Render';
import withCapabilities from 'web/utils/withCapabilities';
const Actions = compose(
  withCapabilities,
  withEntitiesActions,
)(({
  capabilities,
  entity,
  onTagCloneClick,
  onTagDeleteClick,
  onTagDownloadClick,
  onTagEditClick,
  onTagDisableClick,
  onTagEnableClick,
}) => {
  const [_] = useTranslation();
  let endisableable = null;

  if (capabilities.mayEdit('tag')) {
    if (entity.isActive()) {
      endisableable = (
        <DisableIcon
          title={_('Disable Tag')}
          value={entity}
          onClick={onTagDisableClick}
        />
      );
    } else {
      endisableable = (
        <EnableIcon
          title={_('Enable Tag')}
          value={entity}
          onClick={onTagEnableClick}
        />
      );
    }
  }
  return (
    <IconDivider grow align={['center', 'center']}>
      {endisableable}
      <TrashIcon
        displayName={_('Tag')}
        entity={entity}
        name="tag"
        onClick={onTagDeleteClick}
      />
      <EditIcon
        displayName={_('Tag')}
        entity={entity}
        name="tag"
        onClick={onTagEditClick}
      />
      <CloneIcon
        displayName={_('Tag')}
        entity={entity}
        name="tag"
        title={_('Clone Tag')}
        value={entity}
        onClick={onTagCloneClick}
      />
      <ExportIcon
        title={_('Export Tag')}
        value={entity}
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
  actionsComponent: ActionsComponent = Actions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => {
  const [_] = useTranslation();
  const {resourceCount, resourceType} = entity;
  return (
    <TableRow>
      <EntityNameTableData
        displayName={_('Tag')}
        entity={entity}
        link={links}
        type="tag"
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
