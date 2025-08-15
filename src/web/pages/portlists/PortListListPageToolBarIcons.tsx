/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {NewIcon, UploadIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';

import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

interface PortListListPageToolBarIconsProps {
  onPortListCreateClick?: () => void;
  onPortListImportClick?: () => void;
}

const PortListListPageToolBarIcons = ({
  onPortListCreateClick,
  onPortListImportClick,
}: PortListListPageToolBarIconsProps) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        anchor="creating-and-managing-port-lists"
        page="scanning"
        title={_('Help: Port Lists')}
      />
      {capabilities.mayCreate('port_list') && (
        <NewIcon title={_('New Port List')} onClick={onPortListCreateClick} />
      )}
      <UploadIcon
        title={_('Import Port List')}
        onClick={onPortListImportClick}
      />
    </IconDivider>
  );
};

export default PortListListPageToolBarIcons;
