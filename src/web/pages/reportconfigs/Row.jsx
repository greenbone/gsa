/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import DetailsLink from 'web/components/link/DetailsLink';
import TableData from 'web/components/table/Data';
import TableRow from 'web/components/table/Row';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import withCapabilities from 'web/utils/withCapabilities';

const Actions = compose(
  withCapabilities,
  withEntitiesActions,
)(({
  entity,
  onReportConfigDeleteClick,
  onReportConfigEditClick,
  onReportConfigCloneClick,
  onReportConfigDownloadClick,
}) => {
  return (
    <IconDivider grow align={['center', 'center']}>
      <TrashIcon
        displayName={_('Report Config')}
        entity={entity}
        name="report_config"
        onClick={onReportConfigDeleteClick}
      />
      <EditIcon
        disabled={entity.predefined}
        displayName={_('Report Config')}
        entity={entity}
        name="report_config"
        onClick={onReportConfigEditClick}
      />
      <CloneIcon
        displayName={_('Report Config')}
        entity={entity}
        name="report_config"
        onClick={onReportConfigCloneClick}
      />
      <ExportIcon
        title={_('Export Report Config')}
        value={entity}
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
    entity.reportFormat.id
  ) : (
    <DetailsLink
      id={entity.reportFormat.id}
      textOnly={!links}
      type="reportformat"
    >
      {entity.reportFormat.name}
    </DetailsLink>
  );

  return (
    <TableRow>
      <EntityNameTableData
        displayName={_('Report Config')}
        entity={entity}
        links={links}
        type="reportconfig"
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
