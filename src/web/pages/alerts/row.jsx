/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import ExportIcon from 'web/components/icon/exporticon';
import StartIcon from 'web/components/icon/starticon';

import IconDivider from 'web/components/layout/icondivider';

import DetailsLink from 'web/components/link/detailslink';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import EntityNameTableData from 'web/entities/entitynametabledata';
import withEntitiesActions from 'web/entities/withEntitiesActions';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import PropTypes from 'web/utils/proptypes';
import {renderYesNo} from 'web/utils/render';
import withCapabilities from 'web/utils/withCapabilities';

import Condition from './condition';
import Event from './event';
import Method from './method';

const Actions = withEntitiesActions(
  ({
    entity,
    onAlertDeleteClick,
    onAlertDownloadClick,
    onAlertCloneClick,
    onAlertEditClick,
    onAlertTestClick,
  }) => (
    <IconDivider align={['center', 'center']} grow>
      <TrashIcon
        displayName={_('Alert')}
        name="alert"
        entity={entity}
        onClick={onAlertDeleteClick}
      />
      <EditIcon
        displayName={_('Alert')}
        name="alert"
        entity={entity}
        onClick={onAlertEditClick}
      />
      <CloneIcon
        displayName={_('Alert')}
        name="alert"
        entity={entity}
        title={_('Clone Alert')}
        value={entity}
        onClick={onAlertCloneClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Alert')}
        onClick={onAlertDownloadClick}
      />
      <StartIcon
        value={entity}
        title={_('Test Alert')}
        onClick={onAlertTestClick}
      />
    </IconDivider>
  ),
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
      textOnly={!caps.mayAccess('filters') || !links}
      type="filter"
      id={filter.id}
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
}) => (
  <TableRow>
    <EntityNameTableData
      entity={entity}
      link={links}
      type="alert"
      displayName={_('Alert')}
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

Row.propTypes = {
  actionsComponent: PropTypes.component,
  capabilities: PropTypes.capabilities.isRequired,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default withCapabilities(Row);

// vim: set ts=2 sw=2 tw=80:
