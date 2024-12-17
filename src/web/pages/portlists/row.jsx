/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import ExportIcon from 'web/components/icon/exporticon';
import IconDivider from 'web/components/layout/icondivider';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';
import EntityNameTableData from 'web/entities/entitynametabledata';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';
import PropTypes from 'web/utils/proptypes';

const IconActions = ({
  entity,
  onPortListDeleteClick,
  onPortListDownloadClick,
  onPortListCloneClick,
  onPortListEditClick,
}) => (
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
}) => (
  <TableRow>
    <EntityNameTableData
      displayName={_('Port List')}
      entity={entity}
      link={links}
      type="portlist"
      onToggleDetailsClick={onToggleDetailsClick}
    />
    <TableData align="start">{entity.port_count.all}</TableData>
    <TableData align="start">{entity.port_count.tcp}</TableData>
    <TableData align="start">{entity.port_count.udp}</TableData>
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
