/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  NVT_FEED,
  SCAP_FEED,
  CERT_FEED,
  GVMD_DATA_FEED,
} from 'gmp/commands/feedstatus';
import _ from 'gmp/locale';
import {parseInt} from 'gmp/parser';
import {hasValue} from 'gmp/utils/identity';
import React, {useState} from 'react';
import CertBundAdvIcon from 'web/components/icon/CertBundAdvIcon';
import CpeLogoIcon from 'web/components/icon/CpeLogoIcon';
import CveIcon from 'web/components/icon/CveIcon';
import DfnCertAdvIcon from 'web/components/icon/DfnCertAdvIcon';
import FeedIcon from 'web/components/icon/FeedIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import NvtIcon from 'web/components/icon/NvtIcon';
import PolicyIcon from 'web/components/icon/PolicyIcon';
import PortListIcon from 'web/components/icon/PortListIcon';
import ReportFormatIcon from 'web/components/icon/ReportFormatIcon';
import ScanConfigIcon from 'web/components/icon/ScanConfigIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import Link from 'web/components/link/Link';
import Reload, {
  USE_DEFAULT_RELOAD_INTERVAL,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/Reload';
import Section from 'web/components/section/Section';
import TableBody from 'web/components/table/Body';
import TableData from 'web/components/table/Data';
import TableHead from 'web/components/table/Head';
import TableRow from 'web/components/table/Row';
import Table from 'web/components/table/StripedTable';
import useGmp from 'web/hooks/useGmp';
import PropTypes from 'web/utils/PropTypes';

const ToolBarIcons = () => (
  <ManualIcon
    anchor="displaying-the-feed-status"
    page="web-interface"
    size="small"
    title={_('Help: Feed Status')}
  />
);

const renderCheck = feed => {
  const age = feed.age.asDays();

  return age >= 30 && !hasValue(feed.currentlySyncing)
    ? _('Please check the automatic synchronization of your system.')
    : '';
};

const renderFeedStatus = feed => {
  if (hasValue(feed.currentlySyncing)) {
    return _('Update in progress...');
  }

  if (hasValue(feed.syncNotAvailable)) {
    const {error} = feed.syncNotAvailable;
    return _('Synchronization issue: {{error}}', {error});
  }

  const age = parseInt(feed.age.asDays());

  if (age >= 30) {
    return _('Too old ({{age}} days)', {age});
  }

  if (age >= 2) {
    return _('{{age}} days old', {age});
  }

  return _('Current');
};

const FeedStatus = ({feeds}) => {
  return (
    <React.Fragment>
      <PageTitle title={_('Feed Status')} />
      <Layout flex="column">
        <span>
          {' '}
          {/* span prevents Toolbar from growing */}
          <ToolBarIcons />
        </span>
        <Section img={<FeedIcon size="large" />} title={_('Feed Status')} />
        <Table>
          <TableBody>
            <TableRow>
              <TableHead>{_('Type')}</TableHead>
              <TableHead>{_('Content')}</TableHead>
              <TableHead>{_('Origin')}</TableHead>
              <TableHead>{_('Version')}</TableHead>
              <TableHead>{_('Status')}</TableHead>
            </TableRow>

            {feeds.map(feed => (
              <TableRow key={feed.feedType}>
                <TableData>{feed.feedType}</TableData>
                <TableData>
                  {feed.feedType === NVT_FEED && (
                    <IconDivider>
                      <Link to="nvts">
                        <IconDivider align={['start', 'center']}>
                          <NvtIcon size="medium" />
                          <span>{_('NVTs')}</span>
                        </IconDivider>
                      </Link>
                    </IconDivider>
                  )}
                  {feed.feedType === SCAP_FEED && (
                    <IconDivider>
                      <Link to="cves">
                        <IconDivider align={['start', 'center']}>
                          <CveIcon size="medium" />
                          <span>{_('CVEs')}</span>
                        </IconDivider>
                      </Link>
                      <Link to="cpes">
                        <IconDivider align={['start', 'center']}>
                          <CpeLogoIcon size="medium" />
                          <span>{_('CPEs')}</span>
                        </IconDivider>
                      </Link>
                    </IconDivider>
                  )}
                  {feed.feedType === CERT_FEED && (
                    <IconDivider>
                      <Link to="certbunds">
                        <IconDivider align={['start', 'center']}>
                          <CertBundAdvIcon size="medium" />
                          <span>{_('CERT-Bund Advisories')}</span>
                        </IconDivider>
                      </Link>
                      <Link to="dfncerts">
                        <IconDivider align={['start', 'center']}>
                          <DfnCertAdvIcon size="medium" />
                          <span>{_('DFN-CERT Advisories')}</span>
                        </IconDivider>
                      </Link>
                    </IconDivider>
                  )}
                  {feed.feedType === GVMD_DATA_FEED && (
                    <IconDivider>
                      <Link filter="predefined=1" to="policies">
                        <IconDivider align={['start', 'center']}>
                          <PolicyIcon size="medium" />
                          <span>{_('Compliance Policies')}</span>
                        </IconDivider>
                      </Link>
                      <Link filter="predefined=1" to="portlists">
                        <IconDivider align={['start', 'center']}>
                          <PortListIcon size="medium" />
                          <span>{_('Port Lists')}</span>
                        </IconDivider>
                      </Link>
                      <Link filter="predefined=1" to="reportformats">
                        <IconDivider align={['start', 'center']}>
                          <ReportFormatIcon size="medium" />
                          <span>{_('Report Formats')}</span>
                        </IconDivider>
                      </Link>
                      <Link filter="predefined=1" to="scanconfigs">
                        <IconDivider align={['start', 'center']}>
                          <ScanConfigIcon size="medium" />
                          <span>{_('Scan Configs')}</span>
                        </IconDivider>
                      </Link>
                    </IconDivider>
                  )}
                </TableData>
                <TableData>{feed.name}</TableData>
                <TableData>{feed.version}</TableData>
                <TableData>
                  <Divider wrap>
                    <strong>{renderFeedStatus(feed)}</strong>
                    <span data-testid="update-msg">{renderCheck(feed)}</span>
                  </Divider>
                </TableData>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Layout>
    </React.Fragment>
  );
};

FeedStatus.propTypes = {
  feeds: PropTypes.array,
};

const FeedStatusWrapper = () => {
  const gmp = useGmp();
  const [feeds, setFeeds] = useState([]);

  const loadFeeds = () =>
    gmp.feedstatus.readFeedInformation().then(response => {
      const {data} = response;
      setFeeds(data);
    });

  const calculateSyncInterval = (feedsArray = []) => {
    const isSyncing = feedsArray.some(feed => hasValue(feed.currentlySyncing));

    return isSyncing
      ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE
      : USE_DEFAULT_RELOAD_INTERVAL;
  };

  return (
    <Reload
      name={'feedstatus'}
      reload={loadFeeds}
      reloadInterval={(feedsArray = feeds) => calculateSyncInterval(feedsArray)}
    >
      {() => <FeedStatus feeds={feeds} />}
    </Reload>
  );
};

export default FeedStatusWrapper;
