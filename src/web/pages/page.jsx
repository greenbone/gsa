/* Copyright (C) 2016-2022 Greenbone AG
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

import React from 'react';

import {withRouter} from 'react-router-dom';

import styled from 'styled-components';

import _ from 'gmp/locale';

import logger from 'gmp/log';

import {isDefined} from 'gmp/utils/identity';

import Capabilities from 'gmp/capabilities/capabilities';

import MenuBar from 'web/components/bar/menubar';

import ErrorBoundary from 'web/components/error/errorboundary';

import Layout from 'web/components/layout/layout';

import LicenseNotification from 'web/components/notification/licensenotification';

import CapabilitiesContext from 'web/components/provider/capabilitiesprovider';
import LicenseProvider from 'web/components/provider/licenseprovider';

import Footer from 'web/components/structure/footer';
import Header from 'web/components/structure/header';
import Main from 'web/components/structure/main';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';
import compose from 'web/utils/compose';

const log = logger.getLogger('web.page');

const StyledLayout = styled(Layout)`
  height: 100%;
`;

class Page extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleCloseLicenseNotification =
      this.handleCloseLicenseNotification.bind(this);

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

    this.setState({
      notificationClosed: false,
    });
  }

  handleCloseLicenseNotification() {
    this.setState({notificationClosed: true});
  }

  render() {
    const {children, location} = this.props;
    const {capabilities, notificationClosed} = this.state;
    if (!isDefined(capabilities)) {
      // only show content after caps have been loaded
      // this avoids ugly re-rendering of parts of the ui (e.g. the menu)
      return null;
    }

    return (
      <CapabilitiesContext.Provider value={capabilities}>
        <LicenseProvider>
          <StyledLayout flex="column" align={['start', 'stretch']}>
            <MenuBar />
            <Header />
            {!notificationClosed && (
              <LicenseNotification
                capabilities={capabilities}
                onCloseClick={this.handleCloseLicenseNotification}
              />
            )}
            <Main>
              <ErrorBoundary
                key={location.pathname}
                message={_('An error occurred on this page.')}
              >
                {children}
              </ErrorBoundary>
            </Main>
            <Footer />
          </StyledLayout>
        </LicenseProvider>
      </CapabilitiesContext.Provider>
    );
  }
}

Page.propTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default compose(withGmp, withRouter)(Page);

// vim: set ts=2 sw=2 tw=80:
