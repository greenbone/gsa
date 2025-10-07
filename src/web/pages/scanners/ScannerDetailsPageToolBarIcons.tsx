/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Scanner from 'gmp/models/scanner';
import {isDefined} from 'gmp/utils/identity';
import {DownloadKeyIcon, VerifyIcon} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import CloneIcon from 'web/entity/icon/CloneIcon';
import CreateIcon from 'web/entity/icon/CreateIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useCapabilities from 'web/hooks/useCapabilities';
import useFeatures from 'web/hooks/useFeatures';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';

interface ScannerDetailsPageToolBarIconsProps {
  entity: Scanner;
  onScannerCloneClick?: (scanner: Scanner) => void;
  onScannerCreateClick?: () => void;
  onScannerCredentialDownloadClick?: (scanner: Scanner) => void;
  onScannerDeleteClick?: (scanner: Scanner) => void;
  onScannerDownloadClick?: (scanner: Scanner) => void;
  onScannerEditClick?: (scanner: Scanner) => void;
  onScannerVerifyClick?: (scanner: Scanner) => void;
}

const ScannerDetailsPageToolBarIcons = ({
  entity,
  onScannerCloneClick,
  onScannerCreateClick,
  onScannerCredentialDownloadClick,
  onScannerDeleteClick,
  onScannerDownloadClick,
  onScannerEditClick,
  onScannerVerifyClick,
}: ScannerDetailsPageToolBarIconsProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const features = useFeatures();
  const gmp = useGmp();
  const showNewScannerIcon =
    capabilities.mayCreate('scanner') &&
    (gmp.settings.enableGreenboneSensor ||
      features.featureEnabled('ENABLE_AGENTS'));
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="managing-scanners"
          page="scanning"
          title={_('Help: Scanners')}
        />
        <ListIcon page="scanners" title={_('Scanner List')} />
      </IconDivider>
      <IconDivider>
        {showNewScannerIcon && (
          <CreateIcon<Scanner>
            entity={entity}
            onClick={() => onScannerCreateClick && onScannerCreateClick()}
          />
        )}
        <CloneIcon<Scanner>
          entity={entity}
          mayClone={entity.isCloneable()}
          onClick={onScannerCloneClick}
        />
        <EditIcon<Scanner> entity={entity} onClick={onScannerEditClick} />
        <TrashIcon<Scanner> entity={entity} onClick={onScannerDeleteClick} />
        <ExportIcon<Scanner>
          title={_('Export Scanner as XML')}
          value={entity}
          onClick={onScannerDownloadClick}
        />
        <VerifyIcon
          title={_('Verify Scanner')}
          value={entity}
          onClick={onScannerVerifyClick}
        />
      </IconDivider>
      <IconDivider>
        {isDefined(entity.credential) && (
          <DownloadKeyIcon<Scanner>
            title={_('Download Certificate')}
            value={entity}
            onClick={onScannerCredentialDownloadClick}
          />
        )}
      </IconDivider>
    </Divider>
  );
};

export default ScannerDetailsPageToolBarIcons;
