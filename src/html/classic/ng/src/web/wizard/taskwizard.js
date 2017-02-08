/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import {extend} from '../../utils.js';
import _ from '../../locale.js';

import Layout from '../layout.js';
import Img from '../img.js';

import Dialog from '../dialog/dialog.js';

import TextField from '../form/textfield.js';

import NewIcon from '../icons/newicon.js';

import './css/wizard.css';

export class TaskWizard extends Dialog {

  constructor(...args) {
    super(...args);

    this.onNewClick = this.onNewClick.bind(this);
  }

  show() {
    let {gmp} = this.context;
    gmp.wizard.quickFirstScan().then(settings => {
      this.setState({
        visible: true,
        hosts: settings.client_address,
        port_list_id: settings.settings.get('Default Port List').value,
        alert_id: settings.settings.get('Default Alert').value,
        config_id: settings.settings.get('Default OpenVAS Scan Config').value,
        ssh_credential: settings.settings.get('Default SSH Credential').value,
        smb_credential: settings.settings.get('Default SMB Credential').value,
        esxi_credential:
        settings.settings.get('Default ESXi Credential').value,
        scanner_id: settings.settings.get('Default OpenVAS Scanner').value,
      });
    });
  }

  defaultState() {
    return extend(super.defaultState(), {
      width: 800,
      title: _('Task Wizard'),
      footer: _('Start Scan'),
    });
  }

  save() {
    let {gmp} = this.context;
    return gmp.wizard.runQuickFirstScan(this.state).then(() => this.close(),
      rej => {
        this.showErrorMessageFromRejection(rej);
        throw rej;
      });
  }

  onNewClick(event) {
    event.preventDefault();
    if (this.props.onNewClick) {
      this.props.onNewClick();
    }
    this.close();
  }

  renderContent() {
    let {hosts} = this.state;
    return (
      <Layout flex>
        <div className="wizardess">
          <Img src="enchantress.svg"/>
        </div>
        <div className="wizard-content">
          <p>
            <b>{_('Quick start: Immediately scan an IP address')}</b>
          </p>
          <div>
            {_('IP address or hostname:')}
            <TextField value={hosts}
              name="hosts"
              size="40" maxLength="2000"
              onChange={this.onValueChange}/>
          </div>
          <div>
            {_('The default address is either your computer' +
              ' or your network gateway.')}
          </div>
          <div>
            {_('As a short-cut I will do the following for you:')}
            <ol>
              <li>{_('Create a new Target')}</li>
              <li>{_('Create a new Task')}</li>
              <li>{_('Start this scan task right away')}</li>
              <li>
                {_('Switch the view to reload every 30 seconds so you can ' +
                  'lean back and watch the scan progress')}
              </li>
            </ol>
          </div>
          <p>
            {_('In fact, you must not lean back. As soon as the scan ' +
              'progress is beyond 1%, you can already jump into the scan ' +
              'report via the link in the Reports Total column and review ' +
              'the results collected so far.')}
          </p>
          <p>
            {_('When creating the Target and Task I will use the defaults ' +
              'as configured in "My Settings".')}
          </p>
          <p>
            {_('By clicking the New Task icon')}
            <NewIcon
              title={_('New Task')}
              onClick={this.onNewClick}/>
            {_('you can create a new Task yourself.')}
          </p>
        </div>
      </Layout>
    );
  }
}

TaskWizard.propTypes = {
  onNewClick: React.PropTypes.func,
};

TaskWizard.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
};

export default TaskWizard;

// vim: set ts=2 sw=2 tw=80:
