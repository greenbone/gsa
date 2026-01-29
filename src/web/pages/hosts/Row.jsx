/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import SeverityBar from 'web/components/bar/SeverityBar';
import Comment from 'web/components/comment/Comment';
import DateTime from 'web/components/date/DateTime';
import {NewIcon} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import OsIcon from 'web/components/icon/OsIcon';
import IconDivider from 'web/components/layout/IconDivider';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import RowDetailsToggle from 'web/entities/RowDetailsToggle';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import DeleteIcon from 'web/entity/icon/DeleteIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import useTranslation from 'web/hooks/useTranslation';
import {AgentIdTableData} from 'web/pages/agents/components/AgentIdColumn';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import withCapabilities from 'web/utils/withCapabilities';
const Actions = compose(
  withCapabilities,
  withEntitiesActions,
)(({
  capabilities,
  entity,
  onTargetCreateFromHostClick,
  onHostEditClick,
  onHostDeleteClick,
  onHostDownloadClick,
}) => {
  const [_] = useTranslation();
  let new_title;
  const can_create_target = capabilities.mayCreate('target');
  if (can_create_target) {
    new_title = _('Create Target from Host');
  } else {
    new_title = _('Permission to create Target denied');
  }
  return (
    <IconDivider grow align={['center', 'center']}>
      <DeleteIcon
        displayName={_('Host')}
        entity={entity}
        name="asset"
        onClick={onHostDeleteClick}
      />
      <EditIcon
        displayName={_('Host')}
        entity={entity}
        name="asset"
        onClick={onHostEditClick}
      />
      <NewIcon
        active={can_create_target}
        title={new_title}
        value={entity}
        onClick={onTargetCreateFromHostClick}
      />
      <ExportIcon
        title={_('Export Host')}
        value={entity}
        onClick={onHostDownloadClick}
      />
    </IconDivider>
  );
});

Actions.propTypes = {
  entity: PropTypes.model,
  onHostDeleteClick: PropTypes.func,
  onHostDownloadClick: PropTypes.func,
  onHostEditClick: PropTypes.func,
  onTargetCreateFromHostClick: PropTypes.func,
};

const Row = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  onToggleDetailsClick,
  ...props
}) => {
  const {details = {}, os} = entity;
  const os_cpe = os;
  const os_txt = isDefined(details.best_os_txt)
    ? details.best_os_txt.value
    : undefined;
  return (
    <TableRow>
      <TableData flex="column">
        <span>
          <RowDetailsToggle name={entity.id} onClick={onToggleDetailsClick}>
            {entity.name}
          </RowDetailsToggle>
        </span>
        <Comment text={entity.comment} />
      </TableData>
      <TableData>{entity.hostname}</TableData>
      <AgentIdTableData agentId={details.agentID?.value} />
      <TableData>{entity.ip}</TableData>
      <TableData>
        <OsIcon osCpe={os_cpe} osTxt={os_txt} />
      </TableData>
      <TableData>
        <SeverityBar severity={entity.severity} />
      </TableData>
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
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default Row;
