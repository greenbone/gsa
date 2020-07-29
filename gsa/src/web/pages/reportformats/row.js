/* Copyright (C) 2017-2020 Greenbone Networks GmbH
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

import 'core-js/features/array/includes';

import React from 'react';

import _ from 'gmp/locale';
import {shortDate} from 'gmp/locale/date';

import EntityNameTableData from 'web/entities/entitynametabledata';

import Comment from 'web/components/comment/comment';

import EditIcon from 'web/entity/icon/editicon';
import ExportIcon from 'web/components/icon/exporticon';
import TrashIcon from 'web/entity/icon/trashicon';

import IconDivider from 'web/components/layout/icondivider';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import {renderYesNo} from 'web/utils/render';
import withCapabilities from 'web/utils/withCapabilities';
import withEntitiesActions from 'web/entities/withEntitiesActions';

import {REPORT_FORMATS_FROM_FEED} from 'web/pages/extras/feedstatuspage';

const Actions = compose(
  withCapabilities,
  withEntitiesActions,
)(
  ({
    capabilities,
    entity,
    onReportFormatDeleteClick,
    onReportFormatDownloadClick,
    onReportFormatEditClick,
  }) => (
    <IconDivider align={['center', 'center']} grow>
      <TrashIcon
        displayName={_('Report Format')}
        name="report_format"
        entity={entity}
        onClick={onReportFormatDeleteClick}
      />
      <EditIcon
        displayName={_('Report Format')}
        disabled={REPORT_FORMATS_FROM_FEED.includes(entity.id)}
        name="report_format"
        entity={entity}
        onClick={onReportFormatEditClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Report Format')}
        onClick={onReportFormatDownloadClick}
      />
    </IconDivider>
  ),
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onReportFormatDeleteClick: PropTypes.func.isRequired,
  onReportFormatDownloadClick: PropTypes.func.isRequired,
  onReportFormatEditClick: PropTypes.func.isRequired,
};

const Row = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => (
  <TableRow>
    <EntityNameTableData
      entity={entity}
      links={links}
      type="reportformat"
      displayName={_('Report Format')}
      onToggleDetailsClick={onToggleDetailsClick}
    >
      {entity.summary && <Comment>({entity.summary})</Comment>}
    </EntityNameTableData>
    <TableData>{entity.extension}</TableData>
    <TableData>{entity.content_type}</TableData>
    <TableData flex="column">
      <span>{renderYesNo(entity.trust.value)}</span>
      {entity.trust.time && <span>({shortDate(entity.trust.time)})</span>}
    </TableData>
    <TableData>{renderYesNo(entity.isActive())}</TableData>
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
