/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {EditIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import TableData from 'web/components/table/Data';
import TableRow from 'web/components/table/TableRow';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

interface SettingTableRowProps {
  setting: {
    comment?: string;
    id?: string;
    name?: string;
  };
  title: string;
  type: string;
}

export const SettingTableRow = ({
  setting,
  title,
  type,
}: SettingTableRowProps) => {
  const {comment, id, name} = setting;
  return (
    <TableRow title={comment}>
      <TableData>{title}</TableData>
      <TableData>
        <Layout>
          {isDefined(id) && (
            <DetailsLink id={id} type={type}>
              {name}
            </DetailsLink>
          )}
        </Layout>
      </TableData>
    </TableRow>
  );
};

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
