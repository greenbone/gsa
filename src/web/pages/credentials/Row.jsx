/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {getCredentialTypeName} from 'gmp/models/credential';
import React from 'react';
import FootNote from 'web/components/footnote/Footnote';
import ExportIcon from 'web/components/icon/ExportIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import TableData from 'web/components/table/Data';
import TableRow from 'web/components/table/Row';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import CredentialDownloadIcon from 'web/pages/credentials/DownloadIcon';
import PropTypes from 'web/utils/PropTypes';


const Actions = withEntitiesActions(
  ({
    entity,
    onCredentialDeleteClick,
    onCredentialDownloadClick,
    onCredentialCloneClick,
    onCredentialEditClick,
    onCredentialInstallerDownloadClick,
  }) => (
    <IconDivider grow align={['start', 'center']}>
      <TrashIcon
        displayName={_('Credential')}
        entity={entity}
        name="credential"
        onClick={onCredentialDeleteClick}
      />
      <EditIcon
        displayName={_('Credential')}
        entity={entity}
        name="credential"
        onClick={onCredentialEditClick}
      />
      <CloneIcon
        displayName={_('Credential')}
        entity={entity}
        name="credential"
        title={_('Clone Credential')}
        value={entity}
        onClick={onCredentialCloneClick}
      />
      <ExportIcon
        title={_('Export Credential')}
        value={entity}
        onClick={onCredentialDownloadClick}
      />
      <CredentialDownloadIcon
        credential={entity}
        onDownload={onCredentialInstallerDownloadClick}
      />
    </IconDivider>
  ),
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onCredentialCloneClick: PropTypes.func.isRequired,
  onCredentialDeleteClick: PropTypes.func.isRequired,
  onCredentialDownloadClick: PropTypes.func.isRequired,
  onCredentialEditClick: PropTypes.func.isRequired,
  onCredentialInstallerDownloadClick: PropTypes.func.isRequired,
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
      displayName={_('Credential')}
      entity={entity}
      link={links}
      type="credential"
      onToggleDetailsClick={onToggleDetailsClick}
    />
    <TableData>
      <Divider>
        <span>{getCredentialTypeName(entity.credential_type)}</span>
        <FootNote>({entity.credential_type})</FootNote>
      </Divider>
    </TableData>
    <TableData>{entity.isAllowInsecure() ? _('Yes') : _('No')}</TableData>
    <TableData>{entity.login}</TableData>
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
