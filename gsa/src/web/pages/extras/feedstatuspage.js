/* Copyright (C) 2017-2020 Greenbone Networks GmbH
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
import React, {useState} from 'react';

import _ from 'gmp/locale';

import {parseInt} from 'gmp/parser';

import {
  NVT_FEED,
  SCAP_FEED,
  CERT_FEED,
  GVMD_DATA_FEED,
} from 'gmp/commands/feedstatus';

import {hasValue} from 'gmp/utils/identity';

import CertBundAdvIcon from 'web/components/icon/certbundadvicon';
import CveIcon from 'web/components/icon/cveicon';
import DfnCertAdvIcon from 'web/components/icon/dfncertadvicon';
import FeedIcon from 'web/components/icon/feedicon';
import ManualIcon from 'web/components/icon/manualicon';
import NvtIcon from 'web/components/icon/nvticon';
import OvalDefIcon from 'web/components/icon/ovaldeficon';
import CpeLogoIcon from 'web/components/icon/cpelogoicon';
import PolicyIcon from 'web/components/icon/policyicon';
import PortListIcon from 'web/components/icon/portlisticon';
import ReportFormatIcon from 'web/components/icon/reportformaticon';
import ScanConfigIcon from 'web/components/icon/scanconfigicon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import Link from 'web/components/link/link';

import Section from 'web/components/section/section';

import Table from 'web/components/table/stripedtable';
import TableBody from 'web/components/table/body';
import TableRow from 'web/components/table/row';
import TableHead from 'web/components/table/head';
import TableData from 'web/components/table/data';

import Reload, {
  USE_DEFAULT_RELOAD_INTERVAL,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/reload';

import useGmp from 'web/utils/useGmp';
import PropTypes from 'web/utils/proptypes';

const ToolBarIcons = () => (
  <ManualIcon
    page="web-interface"
    anchor="displaying-the-feed-status"
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

  const age = parseInt(feed.age.asDays());

  if (age >= 30) {
    return _('Too old ({{age}} days)', {age});
  }

  if (age >= 2) {
    return _('{{age}} days old', {age});
  }
  return _('Current');
};

export const COMPLIANCE_POLICIES_FROM_FEED = [
  'c4b7c0cb-6502-4809-b034-8e635311b3e6', // IT-Grundschutz
];

export const PORT_LISTS_FROM_FEED = [
  '33d0cd82-57c6-11e1-8ed1-406186ea4fc5', // All IANA assigned TCP
  '4a4717fe-57d2-11e1-9a26-406186ea4fc5', // All IANA assigned TCP and UDP
  '730ef368-57e2-11e1-a90f-406186ea4fc5', // All TCP and Nmap top 100 UDP
];

export const REPORT_FORMATS_FROM_FEED = [
  '5057e5cc-b825-11e4-9d0e-28d24461215b', // Anonymous XML
  'c1645568-627a-11e3-a660-406186ea4fc5', // CSV Results
  '77bd6c4a-1f62-11e1-abf0-406186ea4fc5', // ITG
  'c402cc3e-b531-11e1-9163-406186ea4fc5', // PDF
  'a3810a62-1f62-11e1-9219-406186ea4fc5', // TXT
  'a994b278-1f62-11e1-96ac-406186ea4fc5', // XML
];

export const SCAN_CONFIGS_FROM_FEED = [
  'd21f6c81-2b88-4ac1-b7b4-a2a9f2ad4663', // Base
  '8715c877-47a0-438d-98a3-27c7a6ab2196', // Discovery
  '085569ce-73ed-11df-83c3-002264764cea', // empty
  'daba56c8-73ec-11df-a475-002264764cea', // Full and fast
  '2d3f051c-55ba-11e3-bf43-406186ea4fc5', // Host Discovery
  'bbca7412-a950-11e3-9109-406186ea4fc5', // System Discovery
];

export const composeObjFilter = (objectIds = []) => {
  let filterString = '';

  objectIds.forEach(id => (filterString += 'uuid=' + id + ' '));

  return filterString;
};

const FeedStatus = ({feeds}) => {
  return (
    <React.Fragment>
      <PageTitle title={_('Feed Status')} />
      <Layout flex="column">
        <ToolBarIcons />
        <Section img={<FeedIcon size="large" />} title={_('Feed Status')} />
        <Table>
          <TableBody>
            <TableRow>
              <TableHead width="3rem">{_('Type')}</TableHead>
              <TableHead width="22rem">{_('Content')}</TableHead>
              <TableHead width="11rem">{_('Origin')}</TableHead>
              <TableHead width="7rem">{_('Version')}</TableHead>
              <TableHead>{_('Status')}</TableHead>
            </TableRow>

            {feeds.map(feed => (
              <TableRow key={feed.feed_type}>
                <TableData>{feed.feed_type}</TableData>
                <TableData>
                  {feed.feed_type === NVT_FEED && (
                    <IconDivider>
                      <Link to="nvts">
                        <IconDivider align={['start', 'center']}>
                          <NvtIcon size="medium" />
                          <span>{_('NVTs')}</span>
                        </IconDivider>
                      </Link>
                    </IconDivider>
                  )}
                  {feed.feed_type === SCAP_FEED && (
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
                      <Link to="ovaldefs">
                        <IconDivider align={['start', 'center']}>
                          <OvalDefIcon size="medium" />
                          <span>{_('OVAL Definitions')}</span>
                        </IconDivider>
                      </Link>
                    </IconDivider>
                  )}
                  {feed.feed_type === CERT_FEED && (
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
                  {feed.feed_type === GVMD_DATA_FEED && (
                    <IconDivider>
                      <Link
                        to="policies"
                        filter={composeObjFilter(COMPLIANCE_POLICIES_FROM_FEED)}
                      >
                        <IconDivider align={['start', 'center']}>
                          <PolicyIcon size="medium" />
                          <span>{_('Compliance Policies')}</span>
                        </IconDivider>
                      </Link>
                      <Link
                        to="portlists"
                        filter={composeObjFilter(PORT_LISTS_FROM_FEED)}
                      >
                        <IconDivider align={['start', 'center']}>
                          <PortListIcon size="medium" />
                          <span>{_('Port Lists')}</span>
                        </IconDivider>
                      </Link>
                      <Link
                        to="reportformats"
                        filter={composeObjFilter(REPORT_FORMATS_FROM_FEED)}
                      >
                        <IconDivider align={['start', 'center']}>
                          <ReportFormatIcon size="medium" />
                          <span>{_('Report Formats')}</span>
                        </IconDivider>
                      </Link>
                      <Link
                        to="scanconfigs"
                        filter={composeObjFilter(SCAN_CONFIGS_FROM_FEED)}
                      >
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
