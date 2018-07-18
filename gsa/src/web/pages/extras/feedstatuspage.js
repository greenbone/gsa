/* Greenbone Security Assistant
*
* Authors:
* Steffen Waterkamp <steffen.waterkamp@greenbone.net>
*
* Copyright:
* Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';

import {parseInt} from 'gmp/parser';

import {NVT_FEED, SCAP_FEED, CERT_FEED} from 'gmp/commands/feedstatus.js';

import ManualIcon from '../../components/icon/manualicon.js';
import Icon from '../../components/icon/icon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import Link from '../../components/link/link.js';

import PropTypes from '../../utils/proptypes.js';

import Section from '../../components/section/section.js';

import Table from '../../components/table/stripedtable.js';
import TableBody from '../../components/table/body.js';
import TableRow from '../../components/table/row.js';
import TableHead from '../../components/table/head.js';
import TableData from '../../components/table/data.js';

import withGmp from '../../utils/withGmp.js';

const ToolBarIcons = () => (
  <ManualIcon
    page="search"
    searchTerm="feed"
    size="medium"
    title={_('Help: Feed Status')}
  />
);

const renderCheck = feed => {
    const age = feed.age.asDays();

    return age >= 10 ?
      _('Please check the automatic synchronization of your system.') : '';
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
        <ToolBarIcons/>
        <Section
          img="feed.svg"
          title={_('Feed Status')}
        />
        <Table>
          <TableBody>
            <TableRow>
              <TableHead width="3rem">
                {_('Type')}
              </TableHead>
              <TableHead width="21rem">
                {_('Content')}
              </TableHead>
              <TableHead width="9rem">
                {_('Origin')}
              </TableHead>
              <TableHead width="7rem">
                {_('Version')}
              </TableHead>
              <TableHead>
                {_('Status')}
              </TableHead>
            </TableRow>

            {feeds.map(feed => (
              <TableRow key={feed.feed_type}>
                <TableData>
                  {feed.feed_type}
                </TableData>
                <TableData>
                  {feed.feed_type === NVT_FEED &&
                    <IconDivider>
                      <Link to="nvts">
                        <IconDivider align={['start', 'center']}>
                          <Icon
                            img="nvt.svg"
                            size="medium"
                          />
                          <span>NVTs</span>
                        </IconDivider>
                      </Link>
                    </IconDivider>
                  }
                  {feed.feed_type === SCAP_FEED &&
                    <IconDivider>
                      <Link to="cves">
                        <IconDivider align={['start', 'center']}>
                          <Icon
                            img="cve.svg"
                            size="medium"
                          />
                          <span>CVEs</span>
                        </IconDivider>
                      </Link>
                      <Link to="cpes">
                        <IconDivider align={['start', 'center']}>
                          <Icon
                            img="cpe.svg"
                            size="medium"
                          />
                          <span>CPEs</span>
                        </IconDivider>
                      </Link>
                      <Link to="ovaldefs">
                        <IconDivider align={['start', 'center']}>
                          <Icon
                            img="ovaldef.svg"
                            size="medium"
                          />
                          <span>OVAL Definitions</span>
                        </IconDivider>
                      </Link>
                    </IconDivider>
                  }
                  {feed.feed_type === CERT_FEED &&
                    <IconDivider>
                      <Link to="certbunds">
                        <IconDivider align={['start', 'center']}>
                          <Icon
                            img="cert_bund_adv.svg"
                            size="medium"
                          />
                          <span>CERT-Bund Advisories</span>
                        </IconDivider>
                      </Link>
                      <Link to="dfncerts">
                        <IconDivider align={['start', 'center']}>
                          <Icon
                            img="dfn_cert_adv.svg"
                            size="medium"
                          />
                          <span>DFN-CERT Advisories</span>
                        </IconDivider>
                      </Link>
                    </IconDivider>
                  }
                </TableData>
                <TableData>
                  {feed.name}
                </TableData>
                <TableData>
                  {feed.version}
                </TableData>
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
};

FeedStatus.propTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default withGmp(FeedStatus);
