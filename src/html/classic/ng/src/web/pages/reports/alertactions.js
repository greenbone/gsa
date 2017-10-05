/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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
import logger from 'gmp/log.js';
import {first} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';
import {render_options} from '../../utils/render.js';
import withGmp from '../../utils/withGmp.js';

import Select2 from '../../components/form/select2.js';

import Icon from '../../components/icon/icon.js';

import IconDivider from '../../components/layout/icondivider.js';

import AlertComponent from '../alerts/component.js';

const log = logger.getLogger('web.report.alertactions');

class AlertActions extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      alerts: [],
    };

    this.handleAlertChange = this.handleAlertChange.bind(this);
    this.handleTestAlert = this.handleTestAlert.bind(this);
    this.onAlertCreated = this.onAlertCreated.bind(this);
  }

  componentDidMount() {
    const {gmp} = this.props;
    gmp.alerts.getAll().then(alerts => {
      const alert_id = first(alerts).id;
      this.setState({
        alerts,
        alert_id,
      });
    });
  }

  handleAlertChange(alert_id) {
    this.setState({alert_id});
  }

  handleTestAlert() {
    const {alert_id} = this.state;
    const {
      gmp,
      report,
      filter,
      showErrorMessage,
      showSuccessMessage,
    } = this.props;

    gmp.report.alert({
      report_id: report.id,
      alert_id,
      filter: filter.simple(),
    }).then(response => {
      showSuccessMessage(_('Running the alert was successfull'));
    }, error => {
        log.error('Failed running alert', error);
        showErrorMessage(_('Failed to run alert.'));
      }
    );
  }

  onAlertCreated(response) {
    const {alerts} = this.state;
    const alert = response.data;

    this.setState({
      alerts: [alert, ...alerts],
      alert_id: alert.id,
    });
  }

  render() {
    const {
      showError,
    } = this.props;
    const {
      alert_id,
      alerts,
    } = this.state;
    return (
      <AlertComponent
        onCreated={this.onAlertCreated}
        onError={showError}
      >
        {({create}) => (
          <IconDivider>
            <Select2
              name="alert_id"
              value={alert_id}
              onChange={this.handleAlertChange}
            >
              {render_options(alerts)}
            </Select2>
            <Icon
              img="start.svg"
              title={_('Run Alert')}
              onClick={this.handleTestAlert}
            />
            <Icon
              img="new.svg"
              title={_('Create new Alert')}
              onClick={create}
            />
          </IconDivider>
        )}
      </AlertComponent>
    );
  }
}

AlertActions.propTypes = {
  filter: PropTypes.filter,
  gmp: PropTypes.gmp.isRequired,
  report: PropTypes.model.isRequired,
  showError: PropTypes.func.isRequired,
  showErrorMessage: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
};

export default withGmp(AlertActions);

// vim: set ts=2 sw=2 tw=80:
