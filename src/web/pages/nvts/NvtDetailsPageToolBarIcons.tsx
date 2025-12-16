/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Nvt from 'gmp/models/nvt';
import {
  NewNoteIcon,
  ResultIcon,
  VulnerabilityIcon,
  NewOverrideIcon,
} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import Link from 'web/components/link/Link';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

interface NvtDetailsPageToolBarIconsProps {
  entity: Nvt;
  onNoteCreateClick?: (entity: Nvt) => void;
  onNvtDownloadClick?: (entity: Nvt) => void;
  onOverrideCreateClick?: (entity: Nvt) => void;
}

const NvtDetailsPageToolBarIcons = ({
  entity,
  onNoteCreateClick,
  onNvtDownloadClick,
  onOverrideCreateClick,
}: NvtDetailsPageToolBarIconsProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="vulnerability-tests-vt"
          page="managing-secinfo"
          title={_('Help: NVTs')}
        />
        <ListIcon page="nvts" title={_('NVT List')} />
      </IconDivider>

      <ExportIcon
        title={_('Export NVT')}
        value={entity}
        onClick={onNvtDownloadClick}
      />

      <IconDivider>
        {capabilities.mayCreate('note') && (
          <NewNoteIcon
            title={_('Add new Note')}
            value={entity}
            onClick={onNoteCreateClick}
          />
        )}
        {capabilities.mayCreate('override') && (
          <NewOverrideIcon
            title={_('Add new Override')}
            value={entity}
            onClick={onOverrideCreateClick}
          />
        )}
      </IconDivider>

      <IconDivider>
        {capabilities.mayAccess('result') && (
          <Link filter={'nvt=' + entity.id} to="results">
            <ResultIcon title={_('Corresponding Results')} />
          </Link>
        )}
        {capabilities.mayAccess('vulnerability') && (
          <Link filter={'uuid=' + entity.id} to="vulnerabilities">
            <VulnerabilityIcon title={_('Corresponding Vulnerabilities')} />
          </Link>
        )}
      </IconDivider>
    </Divider>
  );
};

export default NvtDetailsPageToolBarIcons;
