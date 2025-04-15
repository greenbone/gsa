/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import useTranslation from 'src/web/hooks/useTranslation';
import {NewIcon} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import TableRow from 'web/components/table/Row';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import withCapabilities from 'web/utils/withCapabilities';
const PoliciesActions = compose(
  withEntitiesActions,
  withCapabilities,
)(
  (
    {
      entity,
      onPolicyDeleteClick,
      onPolicyDownloadClick,
      onPolicyCloneClick,
      onPolicyEditClick,
      onCreateAuditClick,
      capabilities,
    }
  ) => {
    const [_] = useTranslation();

    return (
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
    );
  },
);

PoliciesActions.propTypes = {
  entity: PropTypes.model.isRequired,
  onCreateAuditClick: PropTypes.func.isRequired,
  onPolicyCloneClick: PropTypes.func.isRequired,
  onPolicyDeleteClick: PropTypes.func.isRequired,
  onPolicyDownloadClick: PropTypes.func.isRequired,
  onPolicyEditClick: PropTypes.func.isRequired,
};

const PoliciesRow = (
  {
    actionsComponent: ActionsComponent = PoliciesActions,
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
        displayName={_('Policy')}
        entity={entity}
        link={links}
        type="policy"
        onToggleDetailsClick={onToggleDetailsClick}
      />
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

PoliciesRow.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default PoliciesRow;
