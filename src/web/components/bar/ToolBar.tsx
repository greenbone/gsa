/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode} from 'react';
import Layout from 'web/components/layout/Layout';
import IconSizeProvider from 'web/components/provider/IconSizeProvider';

interface ToolBarProps {
  children?: ReactNode;
}

const ToolBar = ({children}: ToolBarProps) => {
  return (
    <IconSizeProvider size="small">
      <Layout flex align={['space-between', 'start']} data-testid="toolbar">
        {children}
      </Layout>
    </IconSizeProvider>
  );
};

export default ToolBar;
