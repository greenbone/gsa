/* Copyright (C) 2016-2019 Greenbone Networks GmbH
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

import styled from 'styled-components';

import _ from 'gmp/locale';

import logger from 'gmp/log';

import {isDefined} from 'gmp/utils/identity';

import Capabilities from 'gmp/capabilities/capabilities';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import MenuBar from 'web/components/bar/menubar';

import ErrorBoundary from 'web/components/error/errorboundary';

import Layout from 'web/components/layout/layout';

import CapabilitiesProvider from 'web/components/provider/capabilitiesprovider'; // eslint-disable-line max-len

import Footer from 'web/components/structure/footer';
import Header from 'web/components/structure/header';
import Main from 'web/components/structure/main';

const log = logger.getLogger('web.page');

const StyledLayout = styled(Layout)`
  height: 100%;
`;

class Page extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {};
  }

  componentDidMount() {
    const {gmp} = this.props;

    gmp.user
      .currentCapabilities()
      .then(response => {
        const capabilities = response.data;
        log.debug('User capabilities', capabilities);
        this.setState({capabilities});
      })
      .catch(rejection => {
        log.error('An error occurred during fetching capabilities', rejection);
        // use empty capabilities
        this.setState({capabilities: new Capabilities()});
      });
  }

  render() {
    const {children} = this.props;
    const {capabilities} = this.state;

    if (!isDefined(capabilities)) {
      // only show content after caps have been loaded
      // this avoids ugly re-rendering of parts of the ui (e.g. the menu)
      return null;
    }

    return (
      <CapabilitiesProvider capabilities={capabilities}>
        <StyledLayout flex="column" align={['start', 'stretch']}>
          <Header />
          <MenuBar />
          <Main>
            <ErrorBoundary message={_('An error occurred on this page.')}>
              {children}
            </ErrorBoundary>
          </Main>
          <Footer />
        </StyledLayout>
      </CapabilitiesProvider>
    );
  }
}

Page.propTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default withGmp(Page);

// vim: set ts=2 sw=2 tw=80:
