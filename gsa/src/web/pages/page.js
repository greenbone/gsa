/* Copyright (C) 2016-2020 Greenbone Networks GmbH
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

import React, {useState, useEffect} from 'react';

import {useLocation} from 'react-router-dom';

import styled from 'styled-components';

import _ from 'gmp/locale';

import logger from 'gmp/log';

import {isDefined} from 'gmp/utils/identity';

import Capabilities from 'gmp/capabilities/capabilities';

import useGmp from 'web/utils/useGmp';
import {useGqlCapabilities} from 'web/utils/useGqlCapabilities';

import MenuBar from 'web/components/bar/menubar';

import ErrorBoundary from 'web/components/error/errorboundary';

import Layout from 'web/components/layout/layout';

import CapabilitiesContext from 'web/components/provider/capabilitiesprovider';

import Footer from 'web/components/structure/footer';
import Header from 'web/components/structure/header';
import Main from 'web/components/structure/main';

const log = logger.getLogger('web.page');

const StyledLayout = styled(Layout)`
  height: 100%;
`;

const Page = ({children}) => {
  const gmp = useGmp();
  const location = useLocation();

  const [capabilities, setCapabilities] = useState();
  const query = useGqlCapabilities();
  const {data, error} = query();

  useEffect(() => {
    if (isDefined(data) && isDefined(data.capabilities)) {
      setCapabilities(new Capabilities(data.capabilities));
    } else {
      log.error(
        'An error during fetching capabilities from hyperion. Trying gmp...',
        error,
      );

      gmp.user
        .currentCapabilities()
        .then(response => {
          const caps = response.data;
          log.debug('User capabilities', caps);
          setCapabilities(caps);
        })
        .catch(rejection => {
          log.error(
            'An error occurred during fetching capabilities',
            rejection,
          );
          // use empty capabilities
          setCapabilities(new Capabilities());
        });
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps
  // if we don't wait for data to become defined, undefined caps will be saved.

  if (!isDefined(capabilities)) {
    // only show content after caps have been loaded
    // this avoids ugly re-rendering of parts of the ui (e.g. the menu)
    return null;
  }

  return (
    <CapabilitiesContext.Provider value={capabilities}>
      <StyledLayout flex="column" align={['start', 'stretch']}>
        <MenuBar />
        <Header />
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
};

export default Page;

// vim: set ts=2 sw=2 tw=80:
