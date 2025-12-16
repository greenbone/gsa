/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type ScanConfig from 'gmp/models/scan-config';
import {UploadIcon} from 'web/components/icon';
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
import useTranslation from 'web/hooks/useTranslation';

interface ScanConfigDetailsPageToolBarIconsProps {
  entity: ScanConfig;
  onScanConfigCloneClick: () => void;
  onScanConfigCreateClick: () => void;
  onScanConfigDeleteClick: () => void;
  onScanConfigDownloadClick: () => void;
  onScanConfigEditClick: () => void;
  onScanConfigImportClick: () => void;
}

const ScanConfigDetailsPageToolBarIcons = ({
  entity,
  onScanConfigCloneClick,
  onScanConfigCreateClick,
  onScanConfigDeleteClick,
  onScanConfigDownloadClick,
  onScanConfigEditClick,
  onScanConfigImportClick,
}: ScanConfigDetailsPageToolBarIconsProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="managing-scan-configurations"
          page="scanning"
          title={_('Help: ScanConfigs')}
        />
        <ListIcon page="scanconfigs" title={_('ScanConfig List')} />
      </IconDivider>
      <IconDivider>
        <CreateIcon entity={entity} onClick={onScanConfigCreateClick} />
        <CloneIcon entity={entity} onClick={onScanConfigCloneClick} />
        <EditIcon
          disabled={entity.predefined}
          entity={entity}
          onClick={onScanConfigEditClick}
        />
        <TrashIcon entity={entity} onClick={onScanConfigDeleteClick} />
        <ExportIcon
          title={_('Export Scan Config as XML')}
          value={entity}
          onClick={onScanConfigDownloadClick}
        />
        {capabilities.mayCreate('config') && (
          <UploadIcon
            title={_('Import Scan Config')}
            onClick={onScanConfigImportClick}
          />
        )}
      </IconDivider>
    </Divider>
  );
};

export default ScanConfigDetailsPageToolBarIcons;
