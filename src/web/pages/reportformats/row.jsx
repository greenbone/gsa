/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import _ from 'gmp/locale';
import {shortDate} from 'gmp/locale/date';

import EntityNameTableData from 'web/entities/entitynametabledata';

import Comment from 'web/components/comment/comment';

import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

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
    onReportFormatDeleteClick,
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
        disabled={entity.predefined}
        name="report_format"
        entity={entity}
        onClick={onReportFormatEditClick}
      />
    </IconDivider>
  ),
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onReportFormatDeleteClick: PropTypes.func.isRequired,
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
