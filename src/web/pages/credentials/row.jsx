/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {getCredentialTypeName} from 'gmp/models/credential';

import FootNote from 'web/components/footnote/footnote';

import ExportIcon from 'web/components/icon/exporticon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import EntityNameTableData from 'web/entities/entitynametabledata';
import withEntitiesActions from 'web/entities/withEntitiesActions';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import PropTypes from 'web/utils/proptypes';

import CredentialDownloadIcon from './downloadicon';

const Actions = withEntitiesActions(
  ({
    entity,
    onCredentialDeleteClick,
    onCredentialDownloadClick,
    onCredentialCloneClick,
    onCredentialEditClick,
    onCredentialInstallerDownloadClick,
  }) => (
    <IconDivider align={['start', 'center']} grow>
      <TrashIcon
        displayName={_('Credential')}
        name="credential"
        entity={entity}
        onClick={onCredentialDeleteClick}
      />
      <EditIcon
        displayName={_('Credential')}
        name="credential"
        entity={entity}
        onClick={onCredentialEditClick}
      />
      <CloneIcon
        displayName={_('Credential')}
        name="credential"
        entity={entity}
        title={_('Clone Credential')}
        value={entity}
        onClick={onCredentialCloneClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Credential')}
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
      entity={entity}
      link={links}
      type="credential"
      displayName={_('Credential')}
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

// vim: set ts=2 sw=2 tw=80:
