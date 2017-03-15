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

import _ from '../../locale.js';
import logger from '../../log.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';

import EntitiesPage from '../entities/page.js';
import {withEntitiesContainer} from '../entities/container.js';

import HelpIcon from '../icons/helpicon.js';
import NewIcon from '../icons/newicon.js';

import {createFilterDialog} from '../powerfilter/dialog.js';

import AlertDialog from './dialogcontainer.js';
import Table from './table.js';

const log = logger.getLogger('web.alerts.alertspage');

const SORT_FIELDS = [
  ['name', _('Name')],
  ['event', _('Event')],
  ['condition', _('Condition')],
  ['method', _('Method')],
  ['filter', _('Filter')],
];

const ToolBarIcons = ({
    onNewAlertClick
  }, {capabilities}) => {
  return (
    <Layout flex>
      <HelpIcon
        page="alerts"
        title={_('Help: Alerts')}/>
      {capabilities.mayCreate('alert') &&
        <NewIcon
          title={_('New Alert')}
          onClick={onNewAlertClick}/>
      }
    </Layout>
  );
};

ToolBarIcons.propTypes = {
  onNewAlertClick: React.PropTypes.func,
};

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

class Page extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleSaveAlert = this.handleSaveAlert.bind(this);
    this.handleTestAlert = this.handleTestAlert.bind(this);
    this.openAlertDialog = this.openAlertDialog.bind(this);
  }

  handleSaveAlert(alert) {
    const {onChanged} = this.props;
    onChanged();
  }

  handleTestAlert(alert) {
    const {entityCommand, showSuccess, showError} = this.props;

    entityCommand.test(alert).then(response => {
      showSuccess(_('Testing the alert was successful.'));
      log.debug('testing success', response.data);
    }, rejection => {
      showError(_('Testing the alert bbb failed.'));
      log.debug('testing failure', rejection);
    });
  }

  openAlertDialog(alert) {
    this.alert_dialog.show({alert});
  }

  render() {
    return (
      <Layout>
        <EntitiesPage
          {...this.props}
          onEntityEdit={this.openAlertDialog}
          onTestAlert={this.handleTestAlert}
          onNewAlertClick={this.openAlertDialog}
        />
        <AlertDialog
          ref={ref => this.alert_dialog = ref}
          onSave={this.handleSaveAlert}
        />
      </Layout>
    );
  }
}

Page.propTypes = {
  entityCommand: PropTypes.entitycommand,
  onChanged: React.PropTypes.func,
  showError: React.PropTypes.func.isRequired,
  showSuccess: React.PropTypes.func.isRequired,
};

export default withEntitiesContainer(Page, 'alert', {
  filterEditDialog: createFilterDialog({
    sortFields: SORT_FIELDS,
  }),
  sectionIcon: 'alert.svg',
  table: Table,
  title: _('Alerts'),
  toolBarIcons: ToolBarIcons,
});

// vim: set ts=2 sw=2 tw=80:
