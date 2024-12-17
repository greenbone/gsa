/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import Comment from 'web/components/comment/comment';
import IconDivider from 'web/components/layout/icondivider';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';
import EntityNameTableData from 'web/entities/entitynametabledata';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';
import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import {renderYesNo} from 'web/utils/render';
import {formattedUserSettingShortDate} from 'web/utils/userSettingTimeDateFormatters';
import withCapabilities from 'web/utils/withCapabilities';

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
    <IconDivider grow align={['center', 'center']}>
      <TrashIcon
        displayName={_('Report Format')}
        entity={entity}
        name="report_format"
        onClick={onReportFormatDeleteClick}
      />
      <EditIcon
        disabled={entity.predefined}
        displayName={_('Report Format')}
        entity={entity}
        name="report_format"
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
      displayName={_('Report Format')}
      entity={entity}
      links={links}
      type="reportformat"
      onToggleDetailsClick={onToggleDetailsClick}
    >
      {entity.summary && <Comment>({entity.summary})</Comment>}
    </EntityNameTableData>
    <TableData>{entity.extension}</TableData>
    <TableData>{entity.content_type}</TableData>
    <TableData flex="column">
      <span>{renderYesNo(entity.trust.value)}</span>
      {entity.trust.time && (
        <span>({formattedUserSettingShortDate(entity.trust.time)})</span>
      )}
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
