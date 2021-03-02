/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import styled from 'styled-components';

import Layout from 'web/components/layout/layout';

import Tab from 'web/components/tab/tab';

import PropTypes from 'web/utils/proptypes';

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
    <Layout flex="column" align={['center', 'center']}>
      <span data-testid="entities-tab-title">{children}</span>
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

// vim: set ts=2 sw=2 tw=80:
