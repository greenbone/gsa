/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Scanner from 'gmp/models/scanner';
import {isDefined} from 'gmp/utils/identity';
import {DownloadKeyIcon, VerifyIcon} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import EntitiesActions, {
  EntitiesActionsProps,
} from 'web/entities/EntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

export interface ScannerActionsProps
  extends Omit<EntitiesActionsProps<Scanner>, 'children'> {
  links?: boolean;
  onScannerDeleteClick?: (scanner: Scanner) => void;
  onScannerEditClick?: (scanner: Scanner) => void;
  onScannerCloneClick?: (scanner: Scanner) => void;
  onScannerDownloadClick?: (scanner: Scanner) => void;
  onScannerVerifyClick?: (scanner: Scanner) => void;
  onScannerCredentialDownloadClick?: (scanner: Scanner) => void;
  onScannerCertificateDownloadClick?: (scanner: Scanner) => void;
}

const ScannerActions = ({
  'data-testid': dataTestId,
  entity,
  selectionType,
  onEntityDeselected,
  onEntitySelected,
  onScannerCloneClick,
  onScannerCertificateDownloadClick,
  onScannerCredentialDownloadClick,
  onScannerDeleteClick,
  onScannerDownloadClick,
  onScannerEditClick,
  onScannerVerifyClick,
}: ScannerActionsProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  return (
    <EntitiesActions<Scanner>
      data-testid={dataTestId}
      entity={entity}
      selectionType={selectionType}
      onEntityDeselected={onEntityDeselected}
      onEntitySelected={onEntitySelected}
    >
      <IconDivider grow align={['start', 'center']}>
        <TrashIcon<Scanner>
          displayName={_('Scanner')}
          entity={entity}
          onClick={onScannerDeleteClick}
        />
        <EditIcon<Scanner>
          displayName={_('Scanner')}
          entity={entity}
          onClick={onScannerEditClick}
        />
        <CloneIcon<Scanner>
          displayName={_('Scanner')}
          entity={entity}
          mayClone={entity.isCloneable()}
          onClick={onScannerCloneClick}
        />
        <ExportIcon<Scanner>
          title={_('Export Scanner')}
          value={entity}
          onClick={onScannerDownloadClick}
        />
        <VerifyIcon<Scanner>
          disabled={!capabilities.mayOp('verify_scanner')}
          title={
            capabilities.mayOp('verify_scanner')
              ? _('Verify Scanner')
              : _('Permissions to verify Scanner denied')
          }
          value={entity}
          onClick={onScannerVerifyClick}
        />
        {isDefined(entity.credential) && (
          <DownloadKeyIcon<Scanner>
            title={_('Download Client Certificate')}
            value={entity}
            onClick={onScannerCredentialDownloadClick}
          />
        )}
        {isDefined(entity.caPub) && (
          <DownloadKeyIcon
            title={_('Download CA Certificate')}
            value={entity}
            onClick={onScannerCertificateDownloadClick}
          />
        )}
      </IconDivider>
    </EntitiesActions>
  );
};

export default ScannerActions;
