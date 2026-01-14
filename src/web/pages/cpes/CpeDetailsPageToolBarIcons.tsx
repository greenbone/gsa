/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Cpe from 'gmp/models/cpe';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import useTranslation from 'web/hooks/useTranslation';

interface CpeDetailsPageToolBarIconsProps {
  entity: Cpe;
  onCpeDownloadClick: (entity: Cpe) => void;
}

const CpeDetailsPageToolBarIcons = ({
  entity,
  onCpeDownloadClick,
}: CpeDetailsPageToolBarIconsProps) => {
  const [_] = useTranslation();

  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="cpe"
          page="managing-secinfo"
          title={_('Help: CPEs')}
        />
        <ListIcon page="cpes" title={_('CPE List')} />
      </IconDivider>
      <ExportIcon
        title={_('Export CPE')}
        value={entity}
        onClick={onCpeDownloadClick}
      />
    </Divider>
  );
};

export default CpeDetailsPageToolBarIcons;
