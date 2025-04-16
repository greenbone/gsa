/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import {StartIcon} from 'web/components/icon';
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
import useTranslation from 'web/hooks/useTranslation';
import Condition from 'web/pages/alerts/Condition';
import Event from 'web/pages/alerts/Event';
import Method from 'web/pages/alerts/Method';
import PropTypes from 'web/utils/PropTypes';
import {renderYesNo} from 'web/utils/Render';
import withCapabilities from 'web/utils/withCapabilities';
const Actions = withEntitiesActions(
  ({
    entity,
    onAlertDeleteClick,
    onAlertDownloadClick,
    onAlertCloneClick,
    onAlertEditClick,
    onAlertTestClick,
  }) => {
    const [_] = useTranslation();

    return (
      <IconDivider grow align={['center', 'center']}>
        <TrashIcon
          displayName={_('Alert')}
          entity={entity}
          name="alert"
          onClick={onAlertDeleteClick}
        />
        <EditIcon
          displayName={_('Alert')}
          entity={entity}
          name="alert"
          onClick={onAlertEditClick}
        />
        <CloneIcon
          displayName={_('Alert')}
          entity={entity}
          name="alert"
          title={_('Clone Alert')}
          value={entity}
          onClick={onAlertCloneClick}
        />
        <ExportIcon
          title={_('Export Alert')}
          value={entity}
          onClick={onAlertDownloadClick}
        />
        <StartIcon
          title={_('Test Alert')}
          value={entity}
          onClick={onAlertTestClick}
        />
      </IconDivider>
    );
  },
);

Actions.propTypes = {
  entity: PropTypes.model,
  onAlertCloneClick: PropTypes.func.isRequired,
  onAlertDeleteClick: PropTypes.func.isRequired,
  onAlertDownloadClick: PropTypes.func.isRequired,
  onAlertEditClick: PropTypes.func.isRequired,
  onAlertTestClick: PropTypes.func.isRequired,
};

const render_filter = (filter, caps, links = true) => {
  if (!isDefined(filter)) {
    return null;
  }

  return (
    <DetailsLink
      id={filter.id}
      textOnly={!caps.mayAccess('filters') || !links}
      type="filter"
    >
      {filter.name}
    </DetailsLink>
  );
};

const Row = ({
  actionsComponent: ActionsComponent = Actions,
  capabilities,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => {
  const [_] = useTranslation();

  return (
    <TableRow>
      <EntityNameTableData
        displayName={_('Alert')}
        entity={entity}
        link={links}
        type="alert"
        onToggleDetailsClick={onToggleDetailsClick}
      />
      <TableData>
        <Event event={entity.event} />
      </TableData>
      <TableData>
        <Condition condition={entity.condition} event={entity.event} />
      </TableData>
      <TableData>
        <Method method={entity.method} />
      </TableData>
      <TableData>{render_filter(entity.filter, capabilities)}</TableData>
      <TableData>{renderYesNo(entity.active)}</TableData>
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

Row.propTypes = {
  actionsComponent: PropTypes.component,
  capabilities: PropTypes.capabilities.isRequired,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default withCapabilities(Row);
