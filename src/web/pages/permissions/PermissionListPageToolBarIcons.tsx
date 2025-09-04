/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {NewIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

interface PermissionListPageToolBarIconsProps {
  onPermissionCreateClick: () => void;
}

const PermissionListPageToolBarIcons = ({
  onPermissionCreateClick,
}: PermissionListPageToolBarIconsProps) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        anchor="managing-permissions"
        page="web-interface-access"
        title={_('Help: Permissions')}
      />
      {capabilities.mayCreate('permission') && (
        <NewIcon
          title={_('New Permission')}
          onClick={onPermissionCreateClick}
        />
      )}
    </IconDivider>
  );
};

export default PermissionListPageToolBarIcons;
