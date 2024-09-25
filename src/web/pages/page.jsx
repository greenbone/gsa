/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import PropTypes from 'web/utils/proptypes';

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
import FeedSyncNotification from 'web/components/notification/FeedSyncNotification/FeedSyncNotification';

import Menu from 'web/components/menu/menu';

import useTranslation from 'web/hooks/useTranslation';

const StyledLayout = styled(Layout)`
  height: calc(-48px + 100vh);
`;

const Container = styled.div`
  flex: 1;
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
          <Container>
            <FeedSyncNotification />
            <ErrorBoundary
              key={location.pathname}
              message={_('An error occurred on this page.')}
            >
              {children}
            </ErrorBoundary>
          </Container>
          <Footer />
        </Main>
      </StyledLayout>
    </CapabilitiesContext.Provider>
  );
};

Page.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Page;
