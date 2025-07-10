/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import Layout from 'web/components/layout/Layout';
import Tab, {TabProps} from 'web/components/tab/Tab';

const TabTitleCounts = styled.span`
  font-size: 0.7em;
`;

interface EntitiesTabProps extends TabProps {
  children: React.ReactNode;
  entities?: Array<unknown>;
  count?: number;
}

const EntitiesTab = ({
  children,
  entities = [],
  count = entities.length,
  ...props
}: EntitiesTabProps) => (
  <Tab {...props}>
    <Layout align={['center', 'center']} flex="column">
      <span>{children}</span>
      <TabTitleCounts>
        (<i>{count}</i>)
      </TabTitleCounts>
    </Layout>
  </Tab>
);

export default EntitiesTab;
