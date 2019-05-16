/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import {isDefined} from 'gmp/utils/identity';

import EditIcon from 'web/components/icon/editicon';
import LdapIcon from 'web/components/icon/ldapicon';
import ManualIcon from 'web/components/icon/manualicon';

import Layout from 'web/components/layout/layout';
import IconDivider from 'web/components/layout/icondivider';
import Section from 'web/components/section/section';

import Table from 'web/components/table/simpletable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import Loading from 'web/components/loading/loading';

import {Col} from 'web/entity/page';

import {renewSessionTimeout} from 'web/store/usersettings/actions';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import {renderYesNo} from 'web/utils/render';
import withGmp from 'web/utils/withGmp';

import LdapDialog from './dialog';

const ToolBarIcons = ({onOpenDialogClick}) => (
  <IconDivider>
    <ManualIcon
      page="gui_administration"
      anchor="ldap"
      size="small"
      title={_('Help: LDAP per-User Authentication')}
    />
    <EditIcon onClick={onOpenDialogClick} />
  </IconDivider>
);

ToolBarIcons.propTypes = {
  onOpenDialogClick: PropTypes.func,
};

class LdapAuthentication extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      authdn: '',
      ldaphost: '',
      enable: '',
      certificateInfo: {},
      loading: 'true',
      dialogVisible: false,
    };

    this.getLdapAuth = this.getLdapAuth.bind(this);
    this.handleSaveSettings = this.handleSaveSettings.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.openDialog = this.openDialog.bind(this);
  }

  componentDidMount() {
    this.load();
  }

  load() {
    this.getLdapAuth().then(this.setState({loading: false}));
  }

  getLdapAuth() {
    const {gmp} = this.props;
    const authData = gmp.user.currentAuthSettings().then(response => {
      const data = response.data.get('method:ldap_connect');
      const {authdn, certificateInfo, enable, ldaphost} = data;
      this.setState({
        authdn,
        certificateInfo,
        enable,
        ldaphost,
      });
    });
    return authData;
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  handleSaveSettings(state) {
    const {authdn, certificate, enable, ldaphost} = state;

    const data = {
      authdn,
      certificate,
      enable,
      ldaphost,
    };
    const {gmp} = this.props;

    this.handleInteraction();

    return gmp.auth.saveLdap(data).then(() => {
      this.getLdapAuth();
      this.setState({dialogVisible: false});
    });
  }

  handleValueChange(value, name) {
    this.setState({[name]: value});
  }

  openDialog() {
    this.setState({dialogVisible: true});
  }

  closeDialog() {
    this.setState({dialogVisible: false});
  }

  render() {
    const {loading} = this.state;
    if (loading) {
      return <Loading />;
    }

    const {
      authdn,
      certificateInfo = {},
      dialogVisible,
      enable,
      ldaphost,
    } = this.state;

    return (
      <React.Fragment>
        <Layout flex="column">
          <ToolBarIcons onOpenDialogClick={this.openDialog} />
          <Section
            img={<LdapIcon size="large" />}
            title={_('LDAP per-User Authentication')}
          />
          <Table>
            <colgroup>
              <Col width="10%" />
              <Col width="90%" />
            </colgroup>
            <TableBody>
              <TableRow>
                <TableData>{_('Enabled')}</TableData>
                <TableData>{renderYesNo(enable)}</TableData>
              </TableRow>
              <TableRow>
                <TableData>{_('LDAP Host')}</TableData>
                <TableData>{ldaphost}</TableData>
              </TableRow>
              <TableRow>
                <TableData>{_('Auth. DN')}</TableData>
                <TableData>{authdn}</TableData>
              </TableRow>
              <TableRow>
                <TableData>{_('Activation')}</TableData>
                <TableData>{certificateInfo.activation_time}</TableData>
              </TableRow>
              <TableRow>
                <TableData>{_('Expiration')}</TableData>
                <TableData>{certificateInfo.expiration_time}</TableData>
              </TableRow>
              <TableRow>
                <TableData>{_('MD5 Fingerprint')}</TableData>
                <TableData>{certificateInfo.md5_fingerprint}</TableData>
              </TableRow>
              <TableRow>
                <TableData>{_('Issued by')}</TableData>
                <TableData>{certificateInfo.issuer}</TableData>
              </TableRow>
            </TableBody>
          </Table>
        </Layout>
        {dialogVisible && (
          <LdapDialog
            authdn={authdn}
            enable={enable}
            ldaphost={ldaphost}
            onClose={this.closeDialog}
            onSave={this.handleSaveSettings}
          />
        )}
      </React.Fragment>
    );
  }
}

LdapAuthentication.propTypes = {
  gmp: PropTypes.gmp.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch, {gmp}) => ({
  onInteraction: () => dispatch(renewSessionTimeout(gmp)()),
});

export default compose(
  withGmp,
  connect(
    undefined,
    mapDispatchToProps,
  ),
)(LdapAuthentication);

// vim: set ts=2 sw=2 tw=80:
