/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import glamorous from 'glamorous';

import {storiesOf} from '@storybook/react';

import PropTypes from '../../utils/proptypes.js';

import Layout from 'web/components/layout/layout.js';

import Tab from '../../components/tab/tab.js';
import TabLayout from '../../components/tab/tablayout.js';
import TabList from '../../components/tab/tablist.js';
import TabPanel from '../../components/tab/tabpanel.js';
import TabPanels from '../../components/tab/tabpanels.js';
import Tabs from '../../components/tab/tabs.js';

const TabTitleCounts = glamorous.span({
  fontSize: '0.7em',
});

const TabTitle = ({title, count}) => (
  <Layout flex="column" align={['center', 'center']}>
    <span>{title}</span>
    <TabTitleCounts>(<i>{(count)}</i>)</TabTitleCounts>
  </Layout>
);

TabTitle.propTypes = {
  count: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
};

class StatefulTabs extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {activeTab: 0};

    this.handleActivateTab = this.handleActivateTab.bind(this);
  }

  handleActivateTab(index) {
    this.setState({activeTab: index});
  }

  render() {
    const {activeTab} = this.state;
    const {disableSecondTab} = this.props;

    return (
      <Layout
        flex="column"
        align="start"
        grow="1"
      >
        <Layout grow="1" flex="column">
          <TabLayout
            grow="1"
            align={['start', 'end']}
          >
            <TabList
              active={activeTab}
              align={['start', 'stretch']}
              onActivateTab={this.handleActivateTab}
            >
              <Tab>
                <TabTitle
                  title="Information"
                  count="42"
                />
              </Tab>
              <Tab
                disabled={disableSecondTab}>
                <TabTitle
                  title="Second Tab"
                  count="1337"
                />
              </Tab>
              <Tab>
                <TabTitle
                  title="Third Tab Is Empty"
                  count="0"
                />
              </Tab>
            </TabList>
          </TabLayout>

          <Tabs active={activeTab}>
            <TabPanels>
              <TabPanel>
                Content of a TabPanel
              </TabPanel>
              <TabPanel>
                Content of a second TabPanel
              </TabPanel>
              <TabPanel>
                {null}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Layout>
      </Layout>
    );
  }
}

StatefulTabs.propTypes = {
  disableSecondTab: PropTypes.bool,
};

storiesOf('Tabs', module)
  .add('default', () => {
    return (
      <StatefulTabs
        activeTab="0"
      />
    );
  })
  .add('second tab is disabled', () => {
    return (
      <StatefulTabs
        activeTab="0"
        disableSecondTab="1"
      />
    );
  });

// vim: set ts=2 sw=2 tw=80:
