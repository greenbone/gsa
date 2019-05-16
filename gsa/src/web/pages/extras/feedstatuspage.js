/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import _ from 'gmp/locale';

import {parseInt} from 'gmp/parser';

import {NVT_FEED, SCAP_FEED, CERT_FEED} from 'gmp/commands/feedstatus';

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

import Link from 'web/components/link/link';

import PropTypes from 'web/utils/proptypes';

import Section from 'web/components/section/section';

import Table from 'web/components/table/stripedtable';
import TableBody from 'web/components/table/body';
import TableRow from 'web/components/table/row';
import TableHead from 'web/components/table/head';
import TableData from 'web/components/table/data';

import withGmp from 'web/utils/withGmp';

const ToolBarIcons = () => (
  <ManualIcon
    page="search"
    searchTerm="feed"
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

class FeedStatus extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      feeds: [],
    };
  }

  componentDidMount() {
    this.loadFeeds();
  }

  loadFeeds() {
    const {gmp} = this.props;
    gmp.feedstatus.readFeedInformation().then(response => {
      const {data: feeds} = response;
      this.setState({feeds});
    });
  }

  render() {
    const {feeds} = this.state;
    return (
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
    );
  }
}

FeedStatus.propTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default withGmp(FeedStatus);
