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
import FeedKeyTab from 'web/pages/feed-configuration/tabs/FeedKeyTab';
import FeedStatusTab from 'web/pages/feed-configuration/tabs/FeedStatusTab';

interface FeedConfigurationPageContentProps {
  feeds: Feed[];
}

const FeedConfigurationPageContent = ({
  feeds,
}: FeedConfigurationPageContentProps) => {
  const [_] = useTranslation();

  const tabs = [
    {
      key: 'status',
      label: _('Feed Status'),
      panel: <FeedStatusTab feeds={feeds} />,
    },
    {key: 'key', label: _('Feed Key'), panel: <FeedKeyTab />},
  ];

  return (
    <>
      <PageTitle title={_('Feed Configuration')} />
      <Layout flex="column">
        <Layout align={['start', 'start']}>
          <IconDivider>
            <ManualIcon
              anchor="displaying-the-feed-configuration"
              page="web-interface"
              size="small"
              title={_('Help: Feed Configuration')}
            />
          </IconDivider>
        </Layout>
        <Section
          img={<FeedIcon size="large" />}
          title={_('Feed Configuration')}
        />
        <TabsContainer flex="column" grow="1">
          <TabLayout align={['start', 'end']} grow="1">
            <TabList align={['start', 'stretch']}>
              {tabs.map(t => (
                <Tab key={t.key}>{t.label}</Tab>
              ))}
            </TabList>
          </TabLayout>

          <Tabs>
            <TabPanels>
              {tabs.map(t => (
                <TabPanel key={t.key}>{t.panel}</TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </TabsContainer>
      </Layout>
    </>
  );
};

const FeedConfigurationPage = () => {
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
      {() => <FeedConfigurationPageContent feeds={feeds} />}
    </Reload>
  );
};

export default FeedConfigurationPage;
