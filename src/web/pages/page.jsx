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

import {useLocation} from 'react-router-dom';

import styled from 'styled-components';

import {isDefined} from 'gmp/utils/identity';

import ErrorBoundary from 'web/components/error/errorboundary';

import Layout from 'web/components/layout/layout';

import CapabilitiesContext from 'web/components/provider/capabilitiesprovider';

import useLoadCapabilities from 'web/hooks/useLoadCapabilities';

import Footer from 'web/components/structure/footer';
import Header from 'web/components/structure/header';
import Main from 'web/components/structure/main';

import Menu from 'web/components/menu/menu';

import useTranslation from 'web/hooks/useTranslation';

const StyledLayout = styled(Layout)`
  height: calc(-48px + 100vh);
`;

const Page = ({children}) => {
  const capabilities = useLoadCapabilities();
  const location = useLocation();
  const [_] = useTranslation();

  if (!isDefined(capabilities)) {
    // only show content after caps have been loaded
    // this avoids ugly re-rendering of parts of the ui (e.g. the menu)
    return null;
  }

  return (
    <CapabilitiesContext.Provider value={capabilities}>
      <Header />
      <StyledLayout flex="row" align={['start', 'stretch']}>
        <Menu />
        <Main>
          <ErrorBoundary
            key={location.pathname}
            message={_('An error occurred on this page.')}
          >
            {children}
          </ErrorBoundary>
        </Main>
      </StyledLayout>
      <Footer />
    </CapabilitiesContext.Provider>
  );
};

export default Page;
