/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import useTranslation from 'src/web/hooks/useTranslation';
import Comment from 'web/components/comment/Comment';
import IconDivider from 'web/components/layout/IconDivider';
import TableData from 'web/components/table/Data';
import TableRow from 'web/components/table/Row';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import {renderYesNo} from 'web/utils/Render';
import {formattedUserSettingShortDate} from 'web/utils/userSettingTimeDateFormatters';
import withCapabilities from 'web/utils/withCapabilities';

const Actions = compose(
  withCapabilities,
  withEntitiesActions,
)(({entity, onReportFormatDeleteClick, onReportFormatEditClick}) => {
  const [_] = useTranslation();

  return (
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
  );
});

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onReportFormatDeleteClick: PropTypes.func.isRequired,
  onReportFormatEditClick: PropTypes.func.isRequired,
};

const Row = (
  {
    actionsComponent: ActionsComponent = Actions,
    entity,
    links = true,
    onToggleDetailsClick,
    ...props
  }
) => {
  const [_] = useTranslation();

  return (
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
};

Row.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default Row;
