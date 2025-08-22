/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {NewIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

interface RoleListPageToolBarIconsProps {
  onRoleCreateClick: () => void;
}

const RoleListPageToolBarIcons = ({
  onRoleCreateClick,
}: RoleListPageToolBarIconsProps) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        anchor="managing-roles"
        page="web-interface-access"
        title={_('Help: Roles')}
      />
      {capabilities.mayCreate('role') && (
        <NewIcon title={_('New Role')} onClick={onRoleCreateClick} />
      )}
    </IconDivider>
  );
};

export default RoleListPageToolBarIcons;
