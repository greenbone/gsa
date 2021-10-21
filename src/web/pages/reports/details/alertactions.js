/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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

import logger from 'gmp/log';

import {ALL_FILTER} from 'gmp/models/filter';

import {isDefined} from 'gmp/utils/identity';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import StartIcon from 'web/components/icon/starticon';

import IconDivider from 'web/components/layout/icondivider';

import TriggerAlertDialog from 'web/pages/reports/triggeralertdialog';

import AlertComponent from 'web/pages/alerts/component';

import {
  loadEntities as loadAlerts,
  selector as alertsSelector,
} from 'web/store/entities/alerts';

import {
  loadReportComposerDefaults,
  renewSessionTimeout,
  saveReportComposerDefaults,
} from 'web/store/usersettings/actions';

import {getReportComposerDefaults} from 'web/store/usersettings/selectors';
import withCapabilities from 'web/utils/withCapabilities';

const log = logger.getLogger('web.report.alertactions');

class AlertActions extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      showTriggerAlertDialog: false,
    };

    this.handleAlertChange = this.handleAlertChange.bind(this);
    this.handleTriggerAlert = this.handleTriggerAlert.bind(this);
    this.onAlertCreated = this.onAlertCreated.bind(this);
    this.handleOpenTriggerAlertDialog = this.handleOpenTriggerAlertDialog.bind(
      this,
    ); /* eslint-disable-line max-len */
    this.handleCloseTriggerAlertDialog = this.handleCloseTriggerAlertDialog.bind(
      this,
    ); /* eslint-disable-line max-len */
  }

  componentDidMount() {
    this.props.loadReportComposerDefaults();
  }

  handleAlertChange(alertId) {
    this.setState({alertId});
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  handleTriggerAlert(state) {
    const {alertId, includeNotes, includeOverrides, storeAsDefault} = state;
    const {
      filter,
      gmp,
      reportId,
      reportComposerDefaults,
      showErrorMessage,
      showSuccessMessage,
    } = this.props;

    const newFilter = filter.copy();
    newFilter.set('notes', includeNotes);
    newFilter.set('overrides', includeOverrides);

    this.handleInteraction();

    if (storeAsDefault) {
      this.props.saveReportComposerDefaults({
        ...reportComposerDefaults,
        defaultAlertId: alertId,
        includeNotes,
        includeOverrides,
      });
    }

    return gmp.report
      .alert({
        report_id: reportId,
        alert_id: alertId,
        filter: newFilter.simple(),
      })
      .then(
        response => {
          showSuccessMessage(_('Running the alert was successful'));
          this.setState({
            alertId: undefined,
            showTriggerAlertDialog: false,
          });
        },
        error => {
          log.error('Failed running alert', error);
          showErrorMessage(_('Failed to run alert.'));
          this.setState({showTriggerAlertDialog: false});
        },
      );
  }

  handleOpenTriggerAlertDialog() {
    this.props.loadAlerts();
    this.setState({
      showTriggerAlertDialog: true,
    });
  }

  handleCloseTriggerAlertDialog() {
    this.setState({
      showTriggerAlertDialog: false,
    });
  }

  onAlertCreated(response) {
    this.props.loadAlerts();
    this.setState({
      alertId: response.data.id,
    });
  }

  render() {
    const {
      alerts,
      capabilities,
      reportComposerDefaults,
      filter,
      showError,
      showThresholdMessage,
      threshold,
      onInteraction,
    } = this.props;
    const {alertId, showTriggerAlertDialog, storeAsDefault} = this.state;
    const mayAccessAlerts = capabilities.mayOp('get_alerts');
    return (
      <AlertComponent
        onCreated={this.onAlertCreated}
        onError={showError}
        onInteraction={onInteraction}
      >
        {({create}) => (
          <React.Fragment>
            {mayAccessAlerts && (
              <IconDivider>
                <StartIcon
                  title={_('Trigger Alert')}
                  onClick={this.handleOpenTriggerAlertDialog}
                />
              </IconDivider>
            )}
            {showTriggerAlertDialog && (
              <TriggerAlertDialog
                alertId={alertId}
                alerts={alerts}
                defaultAlertId={reportComposerDefaults.defaultAlertId}
                filter={filter}
                includeNotes={reportComposerDefaults.includeNotes}
                includeOverrides={reportComposerDefaults.includeOverrides}
                showThresholdMessage={showThresholdMessage}
                storeAsDefault={storeAsDefault}
                threshold={threshold}
                onAlertChange={this.handleAlertChange}
                onClose={this.handleCloseTriggerAlertDialog}
                onNewAlertClick={create}
                onSave={this.handleTriggerAlert}
              />
            )}
          </React.Fragment>
        )}
      </AlertComponent>
    );
  }
}

AlertActions.propTypes = {
  alerts: PropTypes.array,
  capabilities: PropTypes.capabilities.isRequired,
  filter: PropTypes.filter,
  gmp: PropTypes.gmp.isRequired,
  loadAlerts: PropTypes.func.isRequired,
  loadReportComposerDefaults: PropTypes.func.isRequired,
  reportComposerDefaults: PropTypes.object,
  reportId: PropTypes.id.isRequired,
  saveReportComposerDefaults: PropTypes.func.isRequired,
  showError: PropTypes.func.isRequired,
  showErrorMessage: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
  showThresholdMessage: PropTypes.bool,
  threshold: PropTypes.number,
  onInteraction: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch, {gmp}) => {
  return {
    onInteraction: () => dispatch(renewSessionTimeout(gmp)()),
    loadAlerts: () => dispatch(loadAlerts(gmp)(ALL_FILTER)),
    loadReportComposerDefaults: () =>
      dispatch(loadReportComposerDefaults(gmp)()),
    saveReportComposerDefaults: reportComposerDefaults =>
      dispatch(saveReportComposerDefaults(gmp)(reportComposerDefaults)),
  };
};

const mapStateToProps = rootState => {
  return {
    alerts: alertsSelector(rootState).getEntities(ALL_FILTER),
    reportComposerDefaults: getReportComposerDefaults(rootState),
  };
};

export default compose(
  withGmp,
  withCapabilities,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(AlertActions);

// vim: set ts=2 sw=2 tw=80:
