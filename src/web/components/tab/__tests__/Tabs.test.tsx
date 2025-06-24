/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith, screen, fireEvent} from 'web/testing';
import Tab from 'web/components/tab/Tab';
import TabList from 'web/components/tab/TabList';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import TabsContainer from 'web/components/tab/TabsContainer';

describe('Tabs', () => {
  test('should render TabList and TabPanels with correct props and update on change', () => {
    const {render} = rendererWith({router: true});

    render(
      <TabsContainer>
        <Tabs>
          <TabList>
            <Tab>Tab 0</Tab>
            <Tab>Tab 1</Tab>
          </TabList>
          <TabPanels>
            <div>Panel 0</div>
            <div>Panel 1</div>
          </TabPanels>
        </Tabs>
      </TabsContainer>,
    );

    expect(screen.getByText('Tab 0')).toBeVisible();
    expect(screen.getByText('Tab 1')).toBeVisible();

    expect(screen.getByText('Panel 0')).toBeVisible();

    fireEvent.click(screen.getByText('Tab 1'));

    expect(screen.getByText('Panel 1')).toBeVisible();
  });
});
