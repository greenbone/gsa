/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useLocation} from 'react-router';
import styled from 'styled-components';
import GSA_VERSION from 'version';
import {isDefined} from 'gmp/utils/identity';
import ErrorBoundary from 'web/components/error/ErrorBoundary';
import Layout from 'web/components/layout/Layout';
import Menu from 'web/components/menu/Menu';
import FeedSyncNotification from 'web/components/notification/FeedSyncNotification/FeedSyncNotification';
import CapabilitiesContext from 'web/components/provider/CapabilitiesProvider';
import Footer from 'web/components/structure/Footer';
import Header from 'web/components/structure/Header';
import Main from 'web/components/structure/Main';
import useGmp from 'web/hooks/useGmp';
import useLoadCapabilities from 'web/hooks/useLoadCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import CommunityFeedUsageNotification from 'web/pages/login/notifications/CommunityFeedUsageNotification';
import Theme from 'web/utils/Theme';

interface PageProps {
  children: React.ReactNode;
}

const StyledLayout = styled(Layout)`
  height: calc(-48px + 100vh);
`;

const Container = styled.div`
  flex: 1;
`;

const ScrollableMenuContainer = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100vh - 48px);
  width: 100%;
  max-width: 250px;
`;

const MenuWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
`;

const Text = styled.div`
  color: ${Theme.mediumGray};
  padding: 1rem;
  margin-top: auto;
`;

const Page = ({children}: PageProps) => {
  const capabilities = useLoadCapabilities();
  const location = useLocation();
  const gmp = useGmp();
  const [_] = useTranslation();

  if (!isDefined(capabilities)) {
    // only show content after caps have been loaded
    // this avoids ugly re-rendering of parts of the ui (e.g. the menu)
    return null;
  }

  return (
    <CapabilitiesContext.Provider value={capabilities}>
      <CommunityFeedUsageNotification />
      <Header />
      <StyledLayout align={['start', 'stretch']} flex="row">
        <ScrollableMenuContainer>
          <MenuWrapper>
            <Menu />
            <Text data-testid={'version'}>
              {isDefined(gmp.settings.vendorVersion)
                ? gmp.settings.vendorVersion
                : _('Version {{version}}', {version: GSA_VERSION})}
            </Text>
          </MenuWrapper>
        </ScrollableMenuContainer>
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

export default Page;
