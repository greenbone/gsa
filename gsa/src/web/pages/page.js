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

import {useLocation} from 'react-router-dom';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import MenuBar from 'web/components/bar/menubar';

import ErrorBoundary from 'web/components/error/errorboundary';
import ErrorPanel from 'web/components/error/errorpanel';

import Layout from 'web/components/layout/layout';

import CapabilitiesContext from 'web/components/provider/capabilitiesprovider';

import Footer from 'web/components/structure/footer';
import Header from 'web/components/structure/header';
import Main from 'web/components/structure/main';

import {useGetCapabilities} from 'web/graphql/capabilities';

const StyledLayout = styled(Layout)`
  height: 100%;
`;

const Page = ({children}) => {
  const location = useLocation();

  const {capabilities, error} = useGetCapabilities();

  if (isDefined(error)) {
    return (
      <ErrorPanel
        error={error}
        message={_('An error occurred while loading the users capabilities.')}
      />
    );
  }

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
