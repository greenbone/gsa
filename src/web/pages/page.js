/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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

import date from 'gmp/models/date';

import {isDefined} from 'gmp/utils/identity';

import Capabilities from 'gmp/capabilities/capabilities';

import MenuBar from 'web/components/bar/menubar';

import ErrorBoundary from 'web/components/error/errorboundary';

import Layout from 'web/components/layout/layout';

import CapabilitiesContext from 'web/components/provider/capabilitiesprovider';

import Footer from 'web/components/structure/footer';
import Header from 'web/components/structure/header';
import Main from 'web/components/structure/main';

import InfoPanel from 'web/components/panel/infopanel';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';
import compose from 'web/utils/compose';

const log = logger.getLogger('web.page');

const LICENSE_EXPIRATION_THRESHOLD = 30;

const StyledLayout = styled(Layout)`
  height: 100%;
`;

const LicenseNotification = ({capabilities, days, license, onCloseClick}) => {
  const {model} = license;
  const titleMessage = _('Your {{model}} license ends in {{days}} days!', {
    model,
    days,
  });
  const message = capabilities.mayOp('modify_license')
    ? _(
        'After that your appliance remains valid and you can still log in ' +
          'and view or download all of your scan reports. You can re-activate ' +
          'the security feed via menu item "Administration > License".',
      )
    : _(
        'After that your appliance remains valid and you can still log in ' +
          'and view or download all of your scan reports. Please contact your ' +
          'administrator for re-activating the security feed.',
      );
  return (
    <InfoPanel
      noMargin={true}
      heading={titleMessage}
      onCloseClick={onCloseClick}
    >
      {message}
    </InfoPanel>
  );
};

LicenseNotification.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  days: PropTypes.number.isRequired,
  license: PropTypes.object.isRequired,
  onCloseClick: PropTypes.func.isRequired,
};

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
      })
      .then(res => {
        if (this.state.capabilities.mayAccess('license')) {
          gmp.license.getLicenseInformation().then(license => {
            this.setState({license: license.data});
          });
        }
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
    const {capabilities, license = {}, notificationClosed} = this.state;

    if (!isDefined(capabilities)) {
      // only show content after caps have been loaded
      // this avoids ugly re-rendering of parts of the ui (e.g. the menu)
      return null;
    }
    const days = date(license.expires).diff(date(), 'days');
    const showLicenseNotification =
      days < LICENSE_EXPIRATION_THRESHOLD && !notificationClosed;

    return (
      <CapabilitiesContext.Provider value={capabilities}>
        <StyledLayout flex="column" align={['start', 'stretch']}>
          <MenuBar />
          <Header />
          {capabilities.mayOp('get_license') && showLicenseNotification && (
            <LicenseNotification
              license={license}
              days={days}
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
      </CapabilitiesContext.Provider>
    );
  }
}

Page.propTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default compose(withGmp, withRouter)(Page);

// vim: set ts=2 sw=2 tw=80:
