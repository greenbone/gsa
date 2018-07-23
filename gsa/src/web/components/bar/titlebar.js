/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import glamorous from 'glamorous';

import _ from 'gmp/locale';

import PropTypes from '../../utils/proptypes.js';

import GBIcon from '../icon/greenboneicon.js';
import Icon from '../icon/icon.js';

import Divider from '../layout/divider.js';
import Layout from '../layout/layout.js';

import Link from '../link/link.js';
import Theme from 'web/utils/theme';

const LogoutLink = glamorous.a({
  color: Theme.darkGray,
  cursor: 'pointer',
  '&:link, &:hover': {
    color: Theme.darkGray,
  },
});

const UserLink = LogoutLink.withComponent(Link);

const GreenboneIcon = glamorous(GBIcon)({
  width: '40px',
  height: '40px',
  marginRight: '4px',
  paddingTop: '1px',
  paddingBottom: '1px',
});

const GsaIconComponent = props => (
  <Icon
    {...props}
    img="gsa.svg"
    size="default"
    alt={_('Greenbone Security Assistant')}
  />
);

const GsaIcon = glamorous(GsaIconComponent)({
  height: '40px',
  paddingTop: '1px',
  paddingBottom: '1px',
});

const Greenbone = () => {
  return (
    <Layout flex>
      <GreenboneIcon/>
      <GsaIcon/>
    </Layout>
  );

};

const TitlebarLayout = glamorous(Layout)(
  'titlebar',
  {
    height: '40px',
    backgroundColor: '#99CE48',
    padding: '0px 5px 0px 5px',
  },
);

class Titlebar extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleLogout = this.handleLogout.bind(this);
  }

  handleLogout(event) {
    const {router, gmp} = this.context;

    event.preventDefault();

    gmp.logout().then(() => {
      router.push('/login?type=logout');
    });
  }


  render() {
    const {gmp} = this.context;
    return (
      <TitlebarLayout
        flex
        align={['space-between', 'center']}
      >
        {gmp.isLoggedIn() &&
          <Link
            to="/"
            title={_('Dashboard')}
          >
            <Greenbone/>
          </Link>
        }
        {gmp.isLoggedIn() ?
          <Divider>
            <span>Logged in as </span>
            <UserLink to="usersettings">
              <b>{gmp.username}</b>
            </UserLink>
            <span> | </span>
            <LogoutLink onClick={this.handleLogout}>Logout</LogoutLink>
          </Divider> :
          <Greenbone/>
        }
      </TitlebarLayout>
    );
  }
}

Titlebar.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
  router: PropTypes.object.isRequired,
};

export default Titlebar;

// vim: set ts=2 sw=2 tw=80:
