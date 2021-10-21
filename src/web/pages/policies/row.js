/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import IconDivider from 'web/components/layout/icondivider';

import ExportIcon from 'web/components/icon/exporticon';
import NewIcon from 'web/components/icon/newicon';

import TableRow from 'web/components/table/row';

import EntityNameTableData from 'web/entities/entitynametabledata';
import withEntitiesActions from 'web/entities/withEntitiesActions';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import compose from 'web/utils/compose';

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
        name="config"
        entity={entity}
        onClick={onPolicyDeleteClick}
      />
      <EditIcon
        displayName={_('Policy')}
        disabled={entity.predefined}
        name="config"
        entity={entity}
        onClick={onPolicyEditClick}
      />
      <CloneIcon
        displayName={_('Policy')}
        name="config"
        entity={entity}
        value={entity}
        onClick={onPolicyCloneClick}
      />
      {capabilities.mayCreate('task') && (
        <NewIcon
          value={entity}
          title={_('Create Audit from Policy')}
          onClick={onCreateAuditClick}
        />
      )}
      <ExportIcon
        value={entity}
        title={_('Export Policy')}
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
      entity={entity}
      link={links}
      type="policy"
      displayName={_('Policy')}
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
