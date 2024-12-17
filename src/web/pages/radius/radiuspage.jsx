/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */



import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import {connect} from 'react-redux';
import EditIcon from 'web/components/icon/editicon';
import ManualIcon from 'web/components/icon/manualicon';
import RadiusIcon from 'web/components/icon/radiusicon';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';
import Loading from 'web/components/loading/loading';
import Section from 'web/components/section/section';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';
import Table from 'web/components/table/simpletable';
import {Col} from 'web/entity/page';
import {renewSessionTimeout} from 'web/store/usersettings/actions';
import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import {renderYesNo} from 'web/utils/render';
import withGmp from 'web/utils/withGmp';

import RadiusDialog from './dialog';

const ToolBarIcons = ({onOpenDialogClick}) => (
  <IconDivider>
    <ManualIcon
      anchor="radius"
      page="web-interface-access"
      size="small"
      title={_('Help: RADIUS Authentication')}
    />
    <EditIcon
      title={_('Edit RADIUS Authentication')}
      onClick={onOpenDialogClick}
    />
  </IconDivider>
);

ToolBarIcons.propTypes = {
  onOpenDialogClick: PropTypes.func,
};

class RadiusAuthentication extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      hasRadiusSupport: true,
      loading: true,
      initial: true,
      dialogVisible: false,
    };

    this.handleSaveSettings = this.handleSaveSettings.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.openDialog = this.openDialog.bind(this);
  }

  componentDidMount() {
    this.loadRadiusAuthSettings();
  }

  loadRadiusAuthSettings() {
    const {gmp} = this.props;
    const authData = gmp.user.currentAuthSettings().then(response => {
      const {data: settings} = response;
      // radius support is enabled in gvm-libs
      const hasRadiusSupport = settings.has('method:radius_connect');
      const {enabled, radiushost, radiuskey} = settings.get(
        'method:radius_connect',
      );
      this.setState({
        hasRadiusSupport,
        enabled,
        radiushost,
        radiuskey,
        loading: false,
        initial: false,
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

  handleSaveSettings({enable, radiushost, radiuskey}) {
    const {gmp} = this.props;

    this.handleInteraction();

    return gmp.auth
      .saveRadius({
        enable,
        radiushost,
        radiuskey,
      })
      .then(() => {
        this.loadRadiusAuthSettings();
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

    const {hasRadiusSupport, dialogVisible, enabled, radiushost, radiuskey} =
      this.state;

    return (
      <React.Fragment>
        <PageTitle title={_('RADIUS Authentication')} />
        <Layout flex="column">
          {hasRadiusSupport && (
            <ToolBarIcons onOpenDialogClick={this.openDialog} />
          )}
          <Section
            img={<RadiusIcon size="large" />}
            title={_('RADIUS Authentication')}
          />
          {hasRadiusSupport ? (
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
                  <TableData>{_('RADIUS Host')}</TableData>
                  <TableData>{radiushost}</TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Secret Key')}</TableData>
                  <TableData>{radiuskey}</TableData>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <p>{_('Support for RADIUS is not available.')}</p>
          )}
        </Layout>
        {dialogVisible && (
          <RadiusDialog
            enable={enabled}
            radiushost={radiushost}
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
  connect(undefined, mapDispatchToProps),
)(RadiusAuthentication);

// vim: set ts=2 sw=2 tw=80:
