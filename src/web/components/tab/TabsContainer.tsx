/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode} from 'react';
import withLayout, {
  type WithLayoutProps,
} from 'web/components/layout/withLayout';
import {TabProvider} from 'web/components/tab/TabContext';

export type TabsContainerProps = WithLayoutProps & {
  children: ReactNode;
};

const LayoutDiv = withLayout()('div');

const TabsContainer = ({children, ...props}: TabsContainerProps) => {
  return (
    <TabProvider>
      <LayoutDiv {...props}>{children}</LayoutDiv>
    </TabProvider>
  );
};

TabsContainer.displayName = 'TabsContainer';

export default TabsContainer;
