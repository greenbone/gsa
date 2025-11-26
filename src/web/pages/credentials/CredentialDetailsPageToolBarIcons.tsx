/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type CredentialDownloadFormat} from 'gmp/commands/credential';
import type Credential from 'gmp/models/credential';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import CloneIcon from 'web/entity/icon/CloneIcon';
import CreateIcon from 'web/entity/icon/CreateIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useTranslation from 'web/hooks/useTranslation';
import CredentialDownloadIcon from 'web/pages/credentials/CredentialDownloadIcon';

interface CredentialDetailsPageToolBarIconsProps {
  entity: Credential;
  onCredentialCloneClick?: (entity: Credential) => void;
  onCredentialCreateClick?: () => void;
  onCredentialDeleteClick?: (entity: Credential) => void;
  onCredentialDownloadClick?: (entity: Credential) => void;
  onCredentialEditClick?: (entity: Credential) => void;
  onCredentialInstallerDownloadClick?: (
    entity: Credential,
    format: CredentialDownloadFormat,
  ) => void;
}

const CredentialDetailsPageToolBarIcons = ({
  entity,
  onCredentialCloneClick,
  onCredentialCreateClick,
  onCredentialDeleteClick,
  onCredentialDownloadClick,
  onCredentialEditClick,
  onCredentialInstallerDownloadClick,
}: CredentialDetailsPageToolBarIconsProps) => {
  const [_] = useTranslation();
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="managing-credentials"
          page="scanning"
          title={_('Help: Credentials')}
        />
        <ListIcon page="credentials" title={_('Credential List')} />
      </IconDivider>
      <IconDivider>
        <CreateIcon entity={entity} onClick={onCredentialCreateClick} />
        <CloneIcon entity={entity} onClick={onCredentialCloneClick} />
        <EditIcon entity={entity} onClick={onCredentialEditClick} />
        <TrashIcon entity={entity} onClick={onCredentialDeleteClick} />
        <ExportIcon
          title={_('Export Credential as XML')}
          value={entity}
          onClick={onCredentialDownloadClick}
        />
      </IconDivider>
      <CredentialDownloadIcon
        credential={entity}
        onDownload={onCredentialInstallerDownloadClick}
      />
    </Divider>
  );
};

export default CredentialDetailsPageToolBarIcons;
