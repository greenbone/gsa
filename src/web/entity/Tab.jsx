/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import Layout from 'web/components/layout/Layout';
import Tab from 'web/components/tab/Tab';
import PropTypes from 'web/utils/PropTypes';

const TabTitleCounts = styled.span`
  font-size: 0.7em;
`;

const EntitiesTab = ({
  children,
  entities = [],
  count = entities.length,
  ...props
}) => (
  <Tab {...props}>
    <Layout align={['center', 'center']} flex="column">
      <span>{children}</span>
      <TabTitleCounts>
        (<i>{count}</i>)
      </TabTitleCounts>
    </Layout>
  </Tab>
);

EntitiesTab.propTypes = {
  count: PropTypes.number,
  entities: PropTypes.array,
};

export default EntitiesTab;
