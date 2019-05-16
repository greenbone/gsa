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
import ManualIcon from 'web/components/icon/manualicon';
import RadiusIcon from 'web/components/icon/radiusicon';

import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';

import Section from 'web/components/section/section';

import Loading from 'web/components/loading/loading';

import Table from 'web/components/table/simpletable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import {Col} from 'web/entity/page';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';
import compose from 'web/utils/compose';
import {renderYesNo} from 'web/utils/render';
import {renewSessionTimeout} from 'web/store/usersettings/actions';

import RadiusDialog from './dialog';

const ToolBarIcons = ({onOpenDialogClick}) => (
  <IconDivider>
    <ManualIcon
      page="gui_administration"
      anchor="radius"
      size="small"
      title={_('Help: RADIUS Authentication')}
    />
    <EditIcon onClick={onOpenDialogClick} />
  </IconDivider>
);

ToolBarIcons.propTypes = {
  onOpenDialogClick: PropTypes.func,
};

class RadiusAuthentication extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      enable: '',
      radiushost: '',
      radiuskey: '',
      loading: true,
      dialogVisible: false,
    };

    this.getRadiusAuth = this.getRadiusAuth.bind(this);
    this.handleSaveSettings = this.handleSaveSettings.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.openDialog = this.openDialog.bind(this);
  }

  componentDidMount() {
    this.load();
  }

  load() {
    this.getRadiusAuth().then(this.setState({loading: false}));
  }

  getRadiusAuth() {
    const {gmp} = this.props;
    const authData = gmp.user.currentAuthSettings().then(response => {
      const data = response.data.get('method:radius_connect');
      const {enable, radiushost, radiuskey} = data;
      this.setState({
        enable,
        radiushost,
        radiuskey,
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
    const {enable, radiushost, radiuskey} = state;

    const data = {
      enable,
      radiushost,
      radiuskey,
    };

    const {gmp} = this.props;

    this.handleInteraction();

    return gmp.auth.saveRadius(data).then(() => {
      this.getRadiusAuth();
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
    const {loading} = this.state;
    if (loading) {
      return <Loading />;
    }

    const {dialogVisible, enable, radiushost, radiuskey} = this.state;

    return (
      <React.Fragment>
        <Layout flex="column">
          <ToolBarIcons onOpenDialogClick={this.openDialog} />
          <Section
            img={<RadiusIcon size="large" />}
            title={_('RADIUS Authentication')}
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
                <TableData>{_('RADIUS Host')}</TableData>
                <TableData>{radiushost}</TableData>
              </TableRow>
              <TableRow>
                <TableData>{_('Secret Key')}</TableData>
                <TableData>********</TableData>
              </TableRow>
            </TableBody>
          </Table>
        </Layout>
        {dialogVisible && (
          <RadiusDialog
            enable={enable}
            radiushost={radiushost}
            radiuskey={radiuskey}
            onClose={this.closeDialog}
            onSave={this.handleSaveSettings}
          />
        )}
      </React.Fragment>
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
  connect(
    undefined,
    mapDispatchToProps,
  ),
)(RadiusAuthentication);

// vim: set ts=2 sw=2 tw=80:
