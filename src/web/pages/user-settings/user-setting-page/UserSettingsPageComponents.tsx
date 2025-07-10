/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
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

/**
 * Component for displaying a simple setting row in the user settings table
 */
interface SimpleSettingRowProps {
  title?: string;
  label: string | React.ReactNode;
  value: string | React.ReactNode;
}

export const SimpleSettingRow = ({
  title = '',
  label,
  value,
}: SimpleSettingRowProps) => (
  <TableRow title={title}>
    <TableData>{label}</TableData>
    <TableData>{value}</TableData>
  </TableRow>
);

// Also export as default for compatibility with tests
// export default getLangNameByCode;

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
