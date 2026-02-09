/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {type Feed} from 'gmp/commands/feed-status';
import {FeedIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import Reload, {
  USE_DEFAULT_RELOAD_INTERVAL,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/Reload';
import Section from 'web/components/section/Section';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import TabsContainer from 'web/components/tab/TabsContainer';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import {FeedKeyProvider} from 'web/pages/feed-configuration/FeedKeyComponent';
import FeedKeyTab from 'web/pages/feed-configuration/FeedKeyTab';
import FeedStatusTab from 'web/pages/feed-configuration/FeedStatusTab';

interface FeedStatusProps {
  feeds: Feed[];
}

interface FeedStatusContentProps {
  feeds: Feed[];
}

const ToolBarIcons = () => {
  const [_] = useTranslation();

  return (
    <IconDivider>
      <ManualIcon
        anchor="displaying-the-feed-configuration"
        page="web-interface"
        size="small"
        title={_('Help: Feed Configuration')}
      />
    </IconDivider>
  );
};

const FeedStatusContent = ({feeds}: FeedStatusContentProps) => {
  const [_] = useTranslation();

  return (
    <>
      <PageTitle title={_('Feed Configuration')} />
      <Layout flex="column">
        <span>
          {' '}
          {/* span prevents Toolbar from growing */}
          <ToolBarIcons />
        </span>
        <Section
          img={<FeedIcon size="large" />}
          title={_('Feed Configuration')}
        />
        <TabsContainer flex="column" grow="1">
          <TabLayout align={['start', 'end']} grow="1">
            <TabList align={['start', 'stretch']}>
              <Tab>{_('Feed Status')}</Tab>
              <Tab>{_('Feed Key')}</Tab>
            </TabList>
          </TabLayout>

          <Tabs>
            <TabPanels>
              <TabPanel>
                <FeedStatusTab feeds={feeds} />
              </TabPanel>
              <TabPanel>
                <FeedKeyTab />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </TabsContainer>
      </Layout>
    </>
  );
};

const FeedStatus = ({feeds}: FeedStatusProps) => {
  return (
    <FeedKeyProvider>
      <FeedStatusContent feeds={feeds} />
    </FeedKeyProvider>
  );
};

const FeedStatusWrapper = () => {
  const gmp = useGmp();
  const [feeds, setFeeds] = useState<Feed[]>([]);

  const loadFeeds = async () => {
    const response = await gmp.feedstatus.readFeedInformation();
    setFeeds(response.data);
  };

  const calculateSyncInterval = (feedsArray: Feed[] = []) => {
    const isSyncing = feedsArray.some(feed => feed.currentlySyncing === true);

    return isSyncing
      ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE
      : USE_DEFAULT_RELOAD_INTERVAL;
  };

  return (
    <Reload
      name="feedstatus"
      reload={loadFeeds}
      reloadInterval={(feedsArray = feeds) => calculateSyncInterval(feedsArray)}
    >
      {() => <FeedStatus feeds={feeds} />}
    </Reload>
  );
};

export default FeedStatusWrapper;
