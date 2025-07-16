/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const IconActions = ({
  entity,
  onPortListDeleteClick,
  onPortListDownloadClick,
  onPortListCloneClick,
  onPortListEditClick,
}) => {
  const [_] = useTranslation();

  return (
    <IconDivider grow align={['center', 'center']}>
      <TrashIcon
        displayName={_('Port List')}
        entity={entity}
        name="portlist"
        onClick={onPortListDeleteClick}
      />
      <EditIcon
        disabled={entity.predefined}
        displayName={_('Port List')}
        entity={entity}
        name="port_list"
        onClick={onPortListEditClick}
      />
      <CloneIcon
        displayName={_('Port List')}
        entity={entity}
        name="port_list"
        onClick={onPortListCloneClick}
      />
      <ExportIcon
        title={_('Export Port List')}
        value={entity}
        onClick={onPortListDownloadClick}
      />
    </IconDivider>
  );
};

IconActions.propTypes = {
  entity: PropTypes.model,
  onPortListCloneClick: PropTypes.func.isRequired,
  onPortListDeleteClick: PropTypes.func.isRequired,
  onPortListDownloadClick: PropTypes.func.isRequired,
  onPortListEditClick: PropTypes.func.isRequired,
};

const Actions = withEntitiesActions(IconActions);

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
        displayName={_('Port List')}
        entity={entity}
        link={links}
        type="portlist"
        onToggleDetailsClick={onToggleDetailsClick}
      />
      <TableData align="start">{entity.portCount.all}</TableData>
      <TableData align="start">{entity.portCount.tcp}</TableData>
      <TableData align="start">{entity.portCount.udp}</TableData>
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
