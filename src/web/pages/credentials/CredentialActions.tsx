/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type CredentialDownloadFormat} from 'gmp/commands/credential';
import type Credential from 'gmp/models/credential';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import EntitiesActions, {
  type EntitiesActionsProps,
} from 'web/entities/EntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useTranslation from 'web/hooks/useTranslation';
import CredentialDownloadIcon from 'web/pages/credentials/CredentialDownloadIcon';

export interface CredentialActionsProps
  extends Omit<EntitiesActionsProps<Credential>, 'children'> {
  onCredentialDeleteClick?: (entity: Credential) => void;
  onCredentialDownloadClick?: (entity: Credential) => void;
  onCredentialCloneClick?: (entity: Credential) => void;
  onCredentialEditClick?: (entity: Credential) => void;
  onCredentialInstallerDownloadClick?: (
    entity: Credential,
    format: CredentialDownloadFormat,
  ) => void;
}

const CredentialActions = ({
  'data-testid': dataTestId,
  entity,
  selectionType,
  onEntityDeselected,
  onEntitySelected,
  onCredentialDeleteClick,
  onCredentialDownloadClick,
  onCredentialCloneClick,
  onCredentialEditClick,
  onCredentialInstallerDownloadClick,
}: CredentialActionsProps) => {
  const [_] = useTranslation();
  return (
    <EntitiesActions
      data-testid={dataTestId}
      entity={entity}
      selectionType={selectionType}
      onEntityDeselected={onEntityDeselected}
      onEntitySelected={onEntitySelected}
    >
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
        <CloneIcon<Credential>
          displayName={_('Credential')}
          entity={entity}
          name="credential"
          title={_('Clone Credential')}
          onClick={onCredentialCloneClick}
        />
        <ExportIcon<Credential>
          title={_('Export Credential')}
          value={entity}
          onClick={onCredentialDownloadClick}
        />
        <CredentialDownloadIcon
          credential={entity}
          onDownload={onCredentialInstallerDownloadClick}
        />
      </IconDivider>
    </EntitiesActions>
  );
};

export default CredentialActions;
