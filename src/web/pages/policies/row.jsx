/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import _ from 'gmp/locale';
import React from 'react';
import ExportIcon from 'web/components/icon/exporticon';
import NewIcon from 'web/components/icon/newicon';
import IconDivider from 'web/components/layout/icondivider';
import TableRow from 'web/components/table/row';
import EntityNameTableData from 'web/entities/entitynametabledata';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';
import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

const PoliciesActions = compose(
  withEntitiesActions,
  withCapabilities,
)(
  ({
    entity,
    onPolicyDeleteClick,
    onPolicyDownloadClick,
    onPolicyCloneClick,
    onPolicyEditClick,
    onCreateAuditClick,
    capabilities,
  }) => (
    <IconDivider grow align={['center', 'center']}>
      <TrashIcon
        displayName={_('Policy')}
        entity={entity}
        name="config"
        onClick={onPolicyDeleteClick}
      />
      <EditIcon
        disabled={entity.predefined}
        displayName={_('Policy')}
        entity={entity}
        name="config"
        onClick={onPolicyEditClick}
      />
      <CloneIcon
        displayName={_('Policy')}
        entity={entity}
        name="config"
        value={entity}
        onClick={onPolicyCloneClick}
      />
      {capabilities.mayCreate('task') && (
        <NewIcon
          title={_('Create Audit from Policy')}
          value={entity}
          onClick={onCreateAuditClick}
        />
      )}
      <ExportIcon
        title={_('Export Policy')}
        value={entity}
        onClick={onPolicyDownloadClick}
      />
    </IconDivider>
  ),
);

PoliciesActions.propTypes = {
  entity: PropTypes.model.isRequired,
  onCreateAuditClick: PropTypes.func.isRequired,
  onPolicyCloneClick: PropTypes.func.isRequired,
  onPolicyDeleteClick: PropTypes.func.isRequired,
  onPolicyDownloadClick: PropTypes.func.isRequired,
  onPolicyEditClick: PropTypes.func.isRequired,
};

const PoliciesRow = ({
  actionsComponent: ActionsComponent = PoliciesActions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => (
  <TableRow>
    <EntityNameTableData
      displayName={_('Policy')}
      entity={entity}
      link={links}
      type="policy"
      onToggleDetailsClick={onToggleDetailsClick}
    />
    <ActionsComponent {...props} entity={entity} />
  </TableRow>
);

PoliciesRow.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default PoliciesRow;

// vim: set ts=2 sw=2 tw=80:
