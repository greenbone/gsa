/* Copyright (C) 2017-2022 Greenbone Networks GmbH
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

import {connect} from 'react-redux';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import EditIcon from 'web/components/icon/editicon';
import LdapIcon from 'web/components/icon/ldapicon';
import ManualIcon from 'web/components/icon/manualicon';

import Layout from 'web/components/layout/layout';
import IconDivider from 'web/components/layout/icondivider';
import Section from 'web/components/section/section';
import PageTitle from 'web/components/layout/pagetitle';

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
      page="web-interface-access"
      anchor="ldap"
      size="small"
      title={_('Help: LDAP per-User Authentication')}
    />
    <EditIcon
      onClick={onOpenDialogClick}
      title={_('Edit LDAP per-User Authentication')}
    />
  </IconDivider>
);

ToolBarIcons.propTypes = {
  onOpenDialogClick: PropTypes.func,
};

class LdapAuthentication extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      hasLdapSupport: true,
      loading: true,
      initial: true,
      dialogVisible: false,
    };

    this.handleSaveSettings = this.handleSaveSettings.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.openDialog = this.openDialog.bind(this);
  }

  componentDidMount() {
    this.loadLdapAuthSettings();
  }

  loadLdapAuthSettings() {
    const {gmp} = this.props;

    this.setState({loading: true});

    return gmp.user.currentAuthSettings().then(response => {
      const {data: settings} = response;
      // ldap support is enabled in gvm-libs
      const hasLdapSupport = settings.has('method:ldap_connect');
      const {authdn, certificateInfo, enabled, ldaphost, ldapsOnly} =
        settings.get('method:ldap_connect');
      this.setState({
        hasLdapSupport,
        authdn,
        certificateInfo,
        enabled,
        ldaphost,
        ldapsOnly,
        loading: false,
        initial: false,
      });
    });
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  handleSaveSettings({authdn, certificate, enable, ldaphost, ldapsOnly}) {
    const {gmp} = this.props;

    this.handleInteraction();

    return gmp.auth
      .saveLdap({
        authdn,
        certificate,
        enable,
        ldaphost,
        ldapsOnly,
      })
      .then(() => {
        this.loadLdapAuthSettings();
        this.setState({dialogVisible: false});
      });
  }

  openDialog() {
    this.setState({dialogVisible: true});
  }

  closeDialog() {
    this.setState({dialogVisible: false});
  }

  render() {
    const {loading, initial} = this.state;
    if (loading && initial) {
      return <Loading />;
    }
    const {
      authdn,
      certificateInfo = {},
      dialogVisible,
      enabled,
      hasLdapSupport,
      ldaphost,
      ldapsOnly,
    } = this.state;

    return (
      <React.Fragment>
        <PageTitle title={_('LDAP per-User Authentication')} />
        <Layout flex="column">
          {hasLdapSupport && (
            <ToolBarIcons onOpenDialogClick={this.openDialog} />
          )}
          <Section
            img={<LdapIcon size="large" />}
            title={_('LDAP per-User Authentication')}
          />
          {hasLdapSupport ? (
            <Table>
              <colgroup>
                <Col width="10%" />
                <Col width="90%" />
              </colgroup>
              <TableBody>
                <TableRow>
                  <TableData>{_('Enabled')}</TableData>
                  <TableData>{renderYesNo(enabled)}</TableData>
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
                <TableRow>
                  <TableData>{_('Use LDAPS only')}</TableData>
                  <TableData>{renderYesNo(ldapsOnly)}</TableData>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <p>{_('Support for LDAP is not available.')}</p>
          )}
        </Layout>

        {dialogVisible && (
          <LdapDialog
            authdn={authdn}
            enable={enabled}
            ldaphost={ldaphost}
            ldapsOnly={ldapsOnly}
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
  connect(undefined, mapDispatchToProps),
)(LdapAuthentication);

// vim: set ts=2 sw=2 tw=80:
