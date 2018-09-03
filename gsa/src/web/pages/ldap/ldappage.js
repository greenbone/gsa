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

import _ from 'gmp/locale';

import {YES_VALUE, NO_VALUE} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';

import Button from 'web/components/form/button';
import CheckBox from 'web/components/form/checkbox';
import FileField from 'web/components/form/filefield';
import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';

import ManualIcon from 'web/components/icon/manualicon';

import Layout from 'web/components/layout/layout';
import Section from 'web/components/section/section';

import Table from 'web/components/table/simpletable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import Loading from 'web/components/loading/loading';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

class LdapAuthentication extends React.Component {

  constructor() {
    super();
    this.state = {
      authdn: '',
      ldaphost: '',
      enable: '',
      certificate_info: {},
      loading: 'true',
    };

    this.getLdapAuth = this.getLdapAuth.bind(this);
    this.handleSaveSettings = this.handleSaveSettings.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
  }

  componentDidMount() {
    this.load();
  }

  load() {
    this.getLdapAuth()
    .then(this.setState({loading: false}));
  }

  getLdapAuth() {
    const {gmp} = this.props;
    const auth_data = gmp.user.currentAuthSettings().then(response => {
      const data = response.data.get('method:ldap_connect');
      let {authdn, certificate_info, enable, ldaphost} = data;
      // handle getting enable as "true" but posting it as 1
      enable = enable === 'true' ? YES_VALUE : NO_VALUE;
      this.setState({
        authdn,
        certificate_info,
        enable,
        ldaphost,
      });
    });
    return auth_data;
  }

  handleSaveSettings() {
    const {
      authdn,
      certificate_info,
      enable,
      ldaphost,
    } = this.state;
    const data = {
      authdn,
      certificate_info,
      enable,
      ldaphost,
    };
    const {gmp} = this.props;
    return gmp.auth.saveLdap(data);
  }

  handleValueChange(value, name) {
    this.setState({[name]: value});
  }

  showCertfificateInfo(certificate_info) {
    if (isDefined(certificate_info)) {
      return (
        <Table>
          <TableBody>
            <TableRow>
              <TableData>
                {_('Activation')}
              </TableData>
              <TableData>
                {certificate_info.activationTime}
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                {_('Expiration')}
              </TableData>
              <TableData>
                {certificate_info.expirationTime}
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                {_('MD5 Fingerprint')}
              </TableData>
              <TableData>
                {certificate_info.md5_fingerprint}
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                {_('Issued by')}
              </TableData>
              <TableData>
                {certificate_info.issuer}
              </TableData>
            </TableRow>
          </TableBody>
        </Table>
      );
    }
    return [];
  }

  render() {
    const {loading} = this.state;
    if (loading) {
      return <Loading/>;
    }

    const {
      authdn,
      certificate_info,
      enable,
      ldaphost,
    } = this.state;

    return (
      <Layout flex="column">
        <ManualIcon
          page="gui_administration"
          anchor="ldap"
          size="medium"
          title={_('Help: LDAP per-User Authentication')}
        />
        <Section
          img="ldap.svg"
          title={_('LDAP per-User Authentication')}
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
          <FormGroup title={_('LDAP Host')} titlesize="5">
            <TextField
              name="ldaphost"
              value={ldaphost}
              size="30"
              onChange={this.handleValueChange}
            />
          </FormGroup>
          <FormGroup title={_('Auth. DN')} titlesize="5">
            <TextField
              name="authdn"
              value={authdn}
              size="30"
              onChange={this.handleValueChange}
            />
          </FormGroup>
          <FormGroup title={_('CA Certificate')} titlesize="5">
            <Layout flex="column">
              {this.showCertfificateInfo(certificate_info)}
              <FileField
                name="certificate"
                onChange={this.handleValueChange}
              />
            </Layout>
          </FormGroup>
          <Layout align="center">
            <Button
              width="auto"
              onClick={this.handleSaveSettings}
            >
              {_('Save')}
            </Button>
          </Layout>
        </Layout>
      </Layout>
    );
  }
}

LdapAuthentication.propTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default withGmp(LdapAuthentication);

// vim: set ts=2 sw=2 tw=80:
