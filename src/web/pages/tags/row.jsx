/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */



import _ from 'gmp/locale';
import {typeName} from 'gmp/utils/entitytype';
import React from 'react';
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
