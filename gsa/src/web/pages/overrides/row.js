/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import {severityValue} from 'gmp/utils/number';

import SeverityBar from 'web/components/bar/severitybar';

import ExportIcon from 'web/components/icon/exporticon';

import IconDivider from 'web/components/layout/icondivider';

import TableRow from 'web/components/table/row';
import TableData from 'web/components/table/data';

import {RowDetailsToggle} from 'web/entities/row';
import withEntitiesActions from 'web/entities/withEntitiesActions';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import PropTypes from 'web/utils/proptypes';
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
    <IconDivider align={['center', 'center']} grow>
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
        value={entity}
        title={_('Export Override')}
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
  links = true,
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
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default Row;

// vim: set ts=2 sw=2 tw=80:
