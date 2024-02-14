/* Copyright (C) 2024 Greenbone AG
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

import EntityNameTableData from 'web/entities/entitynametabledata';

import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';
import CloneIcon from 'web/entity/icon/cloneicon';
import ExportIcon from 'web/components/icon/exporticon';

import IconDivider from 'web/components/layout/icondivider';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';
import DetailsLink from 'web/components/link/detailslink';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import withEntitiesActions from 'web/entities/withEntitiesActions';

const Actions = compose(
  withCapabilities,
  withEntitiesActions,
)(({
  capabilities,
  entity,
  onReportConfigDeleteClick,
  onReportConfigEditClick,
  onReportConfigCloneClick,
  onReportConfigDownloadClick,
}) => {
  return (
    <IconDivider align={['center', 'center']} grow>
      <TrashIcon
        displayName={_('Report Config')}
        name="report_config"
        entity={entity}
        onClick={onReportConfigDeleteClick}
      />
      <EditIcon
        displayName={_('Report Config')}
        disabled={entity.predefined}
        name="report_config"
        entity={entity}
        onClick={onReportConfigEditClick}
      />
      <CloneIcon
        entity={entity}
        displayName={_('Report Config')}
        name="report_config"
        onClick={onReportConfigCloneClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Report Config')}
        onClick={onReportConfigDownloadClick}
      />
    </IconDivider>
  );
});

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onReportConfigDeleteClick: PropTypes.func.isRequired,
  onReportConfigEditClick: PropTypes.func.isRequired,
};

const Row = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => {
  const reportFormat = entity.orphan ? (
    entity.report_format.id
  ) : (
    <DetailsLink
      type="reportformat"
      id={entity.report_format.id}
      textOnly={!links}
    >
      {entity.report_format.name}
    </DetailsLink>
  );

  return (
    <TableRow>
      <EntityNameTableData
        entity={entity}
        links={links}
        type="reportconfig"
        displayName={_('Report Config')}
        onToggleDetailsClick={onToggleDetailsClick}
      />
      <TableData>
        <span>{reportFormat}</span>
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
