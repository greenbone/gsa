/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {EditIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

interface ToolBarIconsProps {
  disableEditIcon: boolean;
  onEditSettingsClick: () => void;
}

export const ToolBarIcons = ({
  disableEditIcon,
  onEditSettingsClick,
}: ToolBarIconsProps) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  const mayEdit = capabilities?.mayEdit?.('setting') ?? false;
  const editIconTitle = mayEdit
    ? _('Edit My Settings')
    : _('Permission to edit settings denied');
  return (
    <Layout>
      <IconDivider>
        <ManualIcon
          anchor="changing-the-user-settings"
          page="web-interface"
          size="small"
          title={_('Help: My Settings')}
        />
        <EditIcon
          disabled={disableEditIcon ?? !mayEdit}
          size="small"
          title={editIconTitle}
          onClick={onEditSettingsClick}
        />
      </IconDivider>
    </Layout>
  );
};
