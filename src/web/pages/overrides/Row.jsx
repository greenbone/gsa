/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import {severityValue} from 'gmp/utils/number';
import {shorten} from 'gmp/utils/string';
import React from 'react';
import SeverityBar from 'web/components/bar/SeverityBar';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import TableData from 'web/components/table/Data';
import TableRow from 'web/components/table/Row';
import RowDetailsToggle from 'web/entities/RowDetailsToggle';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import PropTypes from 'web/utils/PropTypes';
import {
  extraRiskFactor,
  translateRiskFactor,
  LOG_VALUE,
} from 'web/utils/severity';

const render_severity = severity => {
  if (isDefined(severity)) {
    if (severity <= LOG_VALUE) {
      return translateRiskFactor(extraRiskFactor(severity));
    }
    return '> ' + severityValue(severity - 0.1);
  }
  return _('Any');
};

const Actions = withEntitiesActions(
  ({
    entity,
    onOverrideDeleteClick,
    onOverrideDownloadClick,
    onOverrideCloneClick,
    onOverrideEditClick,
  }) => (
    <IconDivider grow align={['center', 'center']}>
      <TrashIcon
        entity={entity}
        name="override"
        onClick={onOverrideDeleteClick}
      />
      <EditIcon entity={entity} name="override" onClick={onOverrideEditClick} />
      <CloneIcon
        entity={entity}
        name="override"
        onClick={onOverrideCloneClick}
      />
      <ExportIcon
        title={_('Export Override')}
        value={entity}
        onClick={onOverrideDownloadClick}
      />
    </IconDivider>
  ),
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onOverrideCloneClick: PropTypes.func.isRequired,
  onOverrideDeleteClick: PropTypes.func.isRequired,
  onOverrideDownloadClick: PropTypes.func.isRequired,
  onOverrideEditClick: PropTypes.func.isRequired,
};

const Row = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  onToggleDetailsClick,
  ...props
}) => (
  <TableRow>
    <TableData>
      <span>
        <RowDetailsToggle name={entity.id} onClick={onToggleDetailsClick}>
          {shorten(entity.text)}
        </RowDetailsToggle>
      </span>
    </TableData>
    <TableData>{entity.nvt ? entity.nvt.name : ''}</TableData>
    <TableData title={entity.hosts}>
      {shorten(entity.hosts.join(', '))}
    </TableData>
    <TableData title={entity.port}>{shorten(entity.port)}</TableData>
    <TableData>{render_severity(entity.severity)}</TableData>
    <TableData>
      <SeverityBar severity={entity.newSeverity} />
    </TableData>
    <TableData>{entity.isActive() ? _('yes') : _('no')}</TableData>
    <ActionsComponent {...props} entity={entity} />
  </TableRow>
);

Row.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model.isRequired,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default Row;
