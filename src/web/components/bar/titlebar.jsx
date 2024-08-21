/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {connect} from 'react-redux';

import styled from 'styled-components';

import _ from 'gmp/locale';

import Logo from 'web/components/img/greenbone';
import Img from 'web/components/img/img';

import Layout from 'web/components/layout/layout';

import Link from 'web/components/link/link';

import UserMenu from 'web/components/menu/usermenu';

import {isLoggedIn} from 'web/store/usersettings/selectors';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';
import useGmp from 'web/hooks/useGmp';

const TITLE_BAR_HEIGHT = '42px';

const GreenboneIcon = styled(Logo)`
  width: 40px;
  height: 40px;
  margin-right: 4px;
  margin-top: 1px;
  margin-bottom: 1px;
`;

const GsaIcon = styled(Img)`
  height: 40px;
  padding-top: 1px;
  padding-bottom: 1px;
`;

const Greenbone = () => (
  <Layout>
    <GreenboneIcon />
    <GsaIcon src="gsa.svg" alt={_('Greenbone Security Assistant')} />
  </Layout>
);

const TitlebarLayout = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${TITLE_BAR_HEIGHT};
  background-color: ${Theme.green};
  padding: 0px 5px 0px 5px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: ${Theme.Layers.menu};
`;

const TitlebarPlaceholder = styled.div`
  height: ${TITLE_BAR_HEIGHT};
`;

const Titlebar = ({loggedIn}) => {
  const gmp = useGmp();
  return (
    <React.Fragment>
      <TitlebarPlaceholder />
      <TitlebarLayout>
        {loggedIn ? (
          <React.Fragment>
            <Link to="/" title={_('Dashboard')}>
              <Greenbone />
            </Link>
            <UserMenu />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Greenbone />
            <div>{gmp.settings.vendorVersion}</div>
          </React.Fragment>
        )}
      </TitlebarLayout>
    </React.Fragment>
  );
};

Titlebar.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
};

const mapStateToProps = rootState => ({
  loggedIn: isLoggedIn(rootState),
});

export default connect(mapStateToProps)(Titlebar);

// vim: set ts=2 sw=2 tw=80:
