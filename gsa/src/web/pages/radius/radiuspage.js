/* Greenbone Security Assistant
*
* Authors:
* Steffen Waterkamp <steffen.waterkamp@greenbone.net>
*
* Copyright:
* Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import {connect} from 'react-redux';

import _ from 'gmp/locale';

import {YES_VALUE, NO_VALUE} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';

import Button from 'web/components/form/button';
import CheckBox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';
import PasswordField from 'web/components/form/passwordfield';
import TextField from 'web/components/form/textfield';

import ManualIcon from 'web/components/icon/manualicon';

import Layout from 'web/components/layout/layout';

import Section from 'web/components/section/section';

import Loading from 'web/components/loading/loading';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';
import compose from 'web/utils/compose';
import {renewSessionTimeout} from 'web/store/usersettings/actions';

class RadiusAuthentication extends React.Component {

  constructor(...args) {
    super(...args);

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

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
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

    this.handleInteraction();

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
        <ManualIcon
          page="gui_administration"
          anchor="radius"
          size="medium"
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
        <FormGroup title=" ">
          <Button
            width="auto"
            onClick={this.handleSaveSettings}
          >
            {_('Save')}
          </Button>
        </FormGroup>
      </Layout>
    );
  }
}

RadiusAuthentication.propTypes = {
  gmp: PropTypes.gmp.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch, {gmp}) => ({
  onInteraction: () => dispatch(renewSessionTimeout(gmp)()),
});

export default compose(
  withGmp,
  connect(undefined, mapDispatchToProps),
)(RadiusAuthentication);

// vim: set ts=2 sw=2 tw=80:
