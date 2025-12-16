/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Cve from 'gmp/models/cve';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import useTranslation from 'web/hooks/useTranslation';

interface CveDetailsPageToolBarIconsProps {
  entity: Cve;
  onCveDownloadClick?: (entity: Cve) => void;
}

const CveDetailsPageToolBarIcons = ({
  entity,
  onCveDownloadClick,
}: CveDetailsPageToolBarIconsProps) => {
  const [_] = useTranslation();
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="cve"
          page="managing-secinfo"
          title={_('Help: CVEs')}
        />
        <ListIcon page="cves" title={_('CVE List')} />
      </IconDivider>
      <ExportIcon
        title={_('Export CVE')}
        value={entity}
        onClick={onCveDownloadClick}
      />
    </Divider>
  );
};

export default CveDetailsPageToolBarIcons;
