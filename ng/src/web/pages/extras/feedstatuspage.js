/* Greenbone Security Assistant
*
* Authors:
* Steffen Waterkamp <steffen.waterkamp@greenbone.net>
*
* Copyright:
* Copyright (C) 2017 Greenbone Networks GmbH
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

import HelpIcon from '../../components/icon/helpicon.js';
import Icon from '../../components/icon/icon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import Link from '../../components/link/link.js';

import moment from 'moment';

import PropTypes from '../../utils/proptypes.js';

import Section from '../../components/section/section.js';

import Table from '../../components/table/stripedtable.js';
import TableBody from '../../components/table/body.js';
import TableRow from '../../components/table/row.js';
import TableHead from '../../components/table/head.js';
import TableData from '../../components/table/data.js';

import withGmp from '../../utils/withGmp.js';

const ToolBarIcons = () => (
  <HelpIcon
    page="feed_management"
    title={_('Help: Feed Status')}
  />
);

const convert_version = version => version.slice(0, 8) + 'T' +
  version.slice(8, 12);

class FeedStatus extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      nvt_feed: {},
      scap_feed: {},
      cert_feed: {},
    };
  }

  componentDidMount() {
    this.readFeeds();
  }

  readFeeds() {
    const {gmp} = this.props;
    gmp.feedstatus.readFeedInformation().then(response => {
      const feedData = response.data;

      for (const current_feed of feedData.feed) {
        switch (current_feed.type) {
          case 'NVT':
            const nvt_feed = this.calculateStatus(current_feed);
            this.setState({nvt_feed});
            break;
          case 'SCAP':
            const scap_feed = this.calculateStatus(current_feed);
            this.setState({scap_feed});
            break;
          case 'CERT':
            const cert_feed = this.calculateStatus(current_feed);
            this.setState({cert_feed});
            break;
          default:
            return undefined;
        }
      }
    });
  }

  calculateStatus(feed) {
    feed.version = convert_version(feed.version);
    let stat = '';
    let checkstring = '';
    const lastUpdate = moment(feed.version);
    const now = moment();
    const age = now.diff(lastUpdate, 'days');

    if (age >= 10) {
      stat = _('Too old ({{age}} days)', {age});
      checkstring = _('Please check the automatic synchronization of your' +
        ' system.');
    }
    else if (age >= 2) {
      stat = _('{{age}} days old', {age});
    }
    else {
      stat = _('Current');
    }
    feed.status = stat;
    feed.checkstring = checkstring;
    return feed;
  }

  render() {
    const {nvt_feed, scap_feed, cert_feed} = this.state;
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
            <TableRow>
              <TableData>
                {nvt_feed.type}
              </TableData>
              <TableData>
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
              </TableData>
              <TableData>
                {nvt_feed.name}
              </TableData>
              <TableData>
                {nvt_feed.version}
              </TableData>
              <TableData>
                <Divider wrap>
                  <strong>{nvt_feed.status}</strong>
                  <span>{nvt_feed.checkstring}</span>
                </Divider>
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                {scap_feed.type}
              </TableData>
              <TableData>
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
              </TableData>
              <TableData>
                {scap_feed.name}
              </TableData>
              <TableData>
                {scap_feed.version}
              </TableData>
              <TableData>
                <Divider wrap>
                  <strong>{scap_feed.status}</strong>
                  <span>{scap_feed.checkstring}</span>
                </Divider>
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                {cert_feed.type}
              </TableData>
              <TableData>
                <IconDivider>
                  <Link to="certbundadvs">
                    <IconDivider align={['start', 'center']}>
                      <Icon
                        img="cert_bund_adv.svg"
                        size="medium"
                      />
                      <span>CERT-Bund Advisories</span>
                    </IconDivider>
                  </Link>
                  <Link to="dfncertadvs">
                    <IconDivider align={['start', 'center']}>
                      <Icon
                        img="dfn_cert_adv.svg"
                        size="medium"
                      />
                      <span>DFN-CERT Advisories</span>
                    </IconDivider>
                  </Link>
                </IconDivider>
              </TableData>
              <TableData>
                {cert_feed.name}
              </TableData>
              <TableData>
                {cert_feed.version}
              </TableData>
              <TableData>
                <Divider wrap>
                  <strong>{cert_feed.status}</strong>
                  <span>{cert_feed.checkstring}</span>
                </Divider>
              </TableData>
            </TableRow>
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
