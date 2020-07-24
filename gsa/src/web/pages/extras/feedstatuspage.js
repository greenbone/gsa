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
import React, {useState, useEffect, useCallback} from 'react';

import _ from 'gmp/locale';

import {parseInt} from 'gmp/parser';

import {
  NVT_FEED,
  SCAP_FEED,
  CERT_FEED,
  GVMD_DATA,
} from 'gmp/commands/feedstatus';

import CertBundAdvIcon from 'web/components/icon/certbundadvicon';
import CveIcon from 'web/components/icon/cveicon';
import DfnCertAdvIcon from 'web/components/icon/dfncertadvicon';
import FeedIcon from 'web/components/icon/feedicon';
import ManualIcon from 'web/components/icon/manualicon';
import NvtIcon from 'web/components/icon/nvticon';
import OvalDefIcon from 'web/components/icon/ovaldeficon';
import CpeLogoIcon from 'web/components/icon/cpelogoicon';

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

import useGmp from 'web/utils/useGmp';
import PolicyIcon from 'web/components/icon/policyicon';
import PortListIcon from 'web/components/icon/portlisticon';
import ReportFormatIcon from 'web/components/icon/reportformaticon';
import ScanConfigIcon from 'web/components/icon/scanconfigicon';

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

  return age >= 10
    ? _('Please check the automatic synchronization of your system.')
    : '';
};

const renderFeedStatus = feed => {
  const age = parseInt(feed.age.asDays());

  if (age >= 10) {
    return _('Too old ({{age}} days)', {age});
  }

  if (age >= 2) {
    return _('{{age}} days old', {age});
  }
  return _('Current');
};

const compliancePolicies = [
  'c4b7c0cb-6502-4809-b034-8e635311b3e6', // IT-Grundschutz
];

const portLists = [
  '33d0cd82-57c6-11e1-8ed1-406186ea4fc5', // All IANA assigned TCP
  '4a4717fe-57d2-11e1-9a26-406186ea4fc5', // All IANA assigned TCP and UDP
  '730ef368-57e2-11e1-a90f-406186ea4fc5', // All TCP and Nmap top 100 UDP
];

const reportFormats = [
  '5057e5cc-b825-11e4-9d0e-28d24461215b', // Anonymous XML
  'c1645568-627a-11e3-a660-406186ea4fc5', // CSV Results
  '77bd6c4a-1f62-11e1-abf0-406186ea4fc5', // ITG
  'c402cc3e-b531-11e1-9163-406186ea4fc5', // PDF
  'a3810a62-1f62-11e1-9219-406186ea4fc5', // TXT
  'a994b278-1f62-11e1-96ac-406186ea4fc5', // XML
];

const composeFeedUrl = objectIds => {
  let url = '';

  objectIds.forEach(id => (url += 'uuid=' + id + ' '));
  return url;
};

const FeedStatus = () => {
  const gmp = useGmp();
  const [feeds, setFeeds] = useState([]);

  const loadFeeds = useCallback(() => {
    gmp.feedstatus.readFeedInformation().then(response => {
      const {data: feeds} = response;
      setFeeds(feeds);
    });
  }, [gmp.feedstatus]);

  useEffect(() => {
    loadFeeds();
  }, [loadFeeds]);

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
              <TableHead width="21rem">{_('Content')}</TableHead>
              <TableHead width="9rem">{_('Origin')}</TableHead>
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
                          <span>NVTs</span>
                        </IconDivider>
                      </Link>
                    </IconDivider>
                  )}
                  {feed.feed_type === SCAP_FEED && (
                    <IconDivider>
                      <Link to="cves">
                        <IconDivider align={['start', 'center']}>
                          <CveIcon size="medium" />
                          <span>CVEs</span>
                        </IconDivider>
                      </Link>
                      <Link to="cpes">
                        <IconDivider align={['start', 'center']}>
                          <CpeLogoIcon size="medium" />
                          <span>CPEs</span>
                        </IconDivider>
                      </Link>
                      <Link to="ovaldefs">
                        <IconDivider align={['start', 'center']}>
                          <OvalDefIcon size="medium" />
                          <span>OVAL Definitions</span>
                        </IconDivider>
                      </Link>
                    </IconDivider>
                  )}
                  {feed.feed_type === CERT_FEED && (
                    <IconDivider>
                      <Link to="certbunds">
                        <IconDivider align={['start', 'center']}>
                          <CertBundAdvIcon size="medium" />
                          <span>CERT-Bund Advisories</span>
                        </IconDivider>
                      </Link>
                      <Link to="dfncerts">
                        <IconDivider align={['start', 'center']}>
                          <DfnCertAdvIcon size="medium" />
                          <span>DFN-CERT Advisories</span>
                        </IconDivider>
                      </Link>
                    </IconDivider>
                  )}
                  {feed.feed_type === GVMD_DATA && (
                    <IconDivider>
                      <Link
                        to="policies"
                        filter={composeFeedUrl(compliancePolicies)}
                      >
                        <IconDivider align={['start', 'center']}>
                          <PolicyIcon size="medium" />
                          <span>Compliance Policies</span>
                        </IconDivider>
                      </Link>
                      <Link to="portlists" filter={composeFeedUrl(portLists)}>
                        <IconDivider align={['start', 'center']}>
                          <PortListIcon size="medium" />
                          <span>Port Lists</span>
                        </IconDivider>
                      </Link>
                      <Link
                        to="reportformats"
                        filter={composeFeedUrl(reportFormats)}
                      >
                        <IconDivider align={['start', 'center']}>
                          <ReportFormatIcon size="medium" />
                          <span>Report Formats</span>
                        </IconDivider>
                      </Link>
                      <Link to="scanconfigs">
                        <IconDivider align={['start', 'center']}>
                          <ScanConfigIcon size="medium" />
                          <span>Scan Configs</span>
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
                    <span>{renderCheck(feed)}</span>
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

export default FeedStatus;
