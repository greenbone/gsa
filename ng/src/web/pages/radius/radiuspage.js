/* Greenbone Security Assistant
*
* Authors:
* Steffen Waterkamp <steffen.waterkamp@greenbone.net>
*
* Copyright:
* Copyright (C) 2017 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';
import {YES_VALUE, NO_VALUE} from 'gmp/parser.js';

import Button from '../../components/form/button.js';
import CheckBox from '../../components/form/checkbox.js';
import FormGroup from '../../components/form/formgroup.js';
import PasswordField from '../../components/form/passwordfield.js';
import TextField from '../../components/form/textfield.js';

import HelpIcon from '../../components/icon/helpicon.js';

import Layout from '../../components/layout/layout.js';
import Section from '../../components/section/section.js';

import Loading from '../../components/loading/loading.js';

import PropTypes from '../../utils/proptypes.js';

import withGmp from '../../utils/withGmp.js';


class RadiusAuthentication extends React.Component {
  constructor() {
    super();
    this.state = {
      enable: '',
      radiushost: '',
      radiuskey: '',
      loading: 'true',
    };

    this.getRadiusAuth = this.getRadiusAuth.bind(this);
    this.handleSaveSettings = this.handleSaveSettings.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
  }

  componentDidMount() {
    this.load();
  }

  load() {
    this.getRadiusAuth()
    .then(this.setState({loading: false}));
  }

  getRadiusAuth() {
    const {gmp} = this.props;
    const auth_data = gmp.user.currentAuthSettings().then(response => {
      const data = response.data.get('method:radius_connect');
      let {enable, radiushost, radiuskey} = data;
      // handle getting enable as "true" but posting it as 1
      enable = enable === 'true' ? YES_VALUE : NO_VALUE;
      this.setState({
        enable,
        radiushost,
        radiuskey,
      });
    });
    return auth_data;
  }

  handleSaveSettings() {
    const {
      enable,
      radiushost,
      radiuskey,
    } = this.state;
    const data = {
      enable,
      radiushost,
      radiuskey,
    };
    const {gmp} = this.props;
    return gmp.auth.saveRadius(data);
  }

  handleValueChange(value, name) {
    this.setState({[name]: value});
  }

  render() {
    const {loading} = this.state;
    if (loading) {
      return <Loading/>;
    }

    const {
      enable,
      radiushost,
      radiuskey,
    } = this.state;

    return (
      <Layout flex="column">
        <HelpIcon
          page="users"
          anchor="radiusauthentication"
          title={_('Help: RADIUS Authentication')}
        />
        <Section
          img="radius.svg"
          title={_('RADIUS Authentication')}
        />
        <Layout flex="column">
          <FormGroup title={_('Enable')} titlesize="5">
            <CheckBox
              name="enable"
              checked={enable === YES_VALUE}
              checkedValue={YES_VALUE}
              unCheckedValue={NO_VALUE}
              onChange={this.handleValueChange}
            />
          </FormGroup>
          <FormGroup title={_('RADIUS Host')} titlesize="5">
            <TextField
              name="radiushost"
              value={radiushost}
              size="30"
              onChange={this.handleValueChange}
            />
          </FormGroup>
          <FormGroup title={_('Secret Key')} titlesize="5">
            <PasswordField
              name="radiuskey"
              value={radiuskey}
              size="30"
              onChange={this.handleValueChange}
            />
          </FormGroup>
        </Layout>
        <Layout align="center">
          <Button
            width="auto"
            onClick={this.handleSaveSettings}
          >
            {_('Save')}
          </Button>
        </Layout>
      </Layout>
    );
  }
}

RadiusAuthentication.propTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default withGmp(RadiusAuthentication);

// vim: set ts=2 sw=2 tw=80:
