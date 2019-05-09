/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import _ from 'gmp/locale';
import {shortDate} from 'gmp/locale/date';

import EntityNameTableData from 'web/entities/entitynametabledata';

import Comment from 'web/components/comment/comment';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';
import VerifyIcon from 'web/entity/icon/verifyicon';

import ExportIcon from 'web/components/icon/exporticon';

import IconDivider from 'web/components/layout/icondivider';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import {renderYesNo} from 'web/utils/render';
import withCapabilities from 'web/utils/withCapabilities';
import withEntitiesActions from 'web/entities/withEntitiesActions';

const Actions = compose(
  withCapabilities,
  withEntitiesActions,
)(
  ({
    capabilities,
    entity,
    onReportFormatCloneClick,
    onReportFormatDeleteClick,
    onReportFormatDownloadClick,
    onReportFormatEditClick,
    onReportFormatVerifyClick,
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
        name="report_format"
        entity={entity}
        onClick={onReportFormatEditClick}
      />
      <CloneIcon
        displayName={_('Report Format')}
        name="report_format"
        entity={entity}
        title={_('Clone Report Format')}
        value={entity}
        onClick={onReportFormatCloneClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Report Format')}
        onClick={onReportFormatDownloadClick}
      />
      <VerifyIcon
        displayName={_('Report Format')}
        name="report_format"
        entity={entity}
        value={entity}
        onClick={onReportFormatVerifyClick}
      />
    </IconDivider>
  ),
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onReportFormatCloneClick: PropTypes.func.isRequired,
  onReportFormatDeleteClick: PropTypes.func.isRequired,
  onReportFormatDownloadClick: PropTypes.func.isRequired,
  onReportFormatEditClick: PropTypes.func.isRequired,
  onReportFormatVerifyClick: PropTypes.func.isRequired,
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
