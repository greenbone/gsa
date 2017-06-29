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

import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';
import {first} from 'gmp/utils.js';

import CredentialsDialog from '../credentials/dialog.js';

import PortListDialog from '../portlists/dialog.js';

import TargetDialog from './dialog.js';

export class TargetDialogContainer extends React.Component {

  constructor(...args) {
    super(...args);

    this.openCredentialsDialog = this.openCredentialsDialog.bind(this);
    this.openPortListDialog = this.openPortListDialog.bind(this);
    this.handleCreateCredential = this.handleCreateCredential.bind(this);
    this.handleCreatePortList = this.handleCreatePortList.bind(this);
    this.handleSaveTarget = this.handleSaveTarget.bind(this);
  }

  openCredentialsDialog(data) {
    this.credentials_dialog.show({
      types: data.types,
      base: first(data.types),
      id_field: data.id_field,
    }, {
      title: data.title,
    });
  }

  show(state, options) {
    let {gmp} = this.context;

    this.target_dialog.show(state, options);

    gmp.portlists.getAll({cache: false}).then(port_lists => {
      this.port_lists = port_lists;
      this.target_dialog.setValue('port_lists', port_lists);
    });

    gmp.credentials.getAll({cache: false}).then(credentials => {
      this.credentials = credentials;
      this.target_dialog.setValue('credentials', credentials);
    });
  }

  openPortListDialog() {
    this.port_list_dialog.show({});
  }

  handleSaveTarget(data) {
    let {gmp} = this.context;
    let {onSave} = this.props;

    let promise;
    if (data && data.id) {
      promise = gmp.target.save(data);
    }
    else {
      promise = gmp.target.create(data);
    }
    return promise.then(response => {
      let target = response.data;
      if (onSave) {
        return onSave(target);
      }
      return undefined;
    });
  }

  handleCreateCredential(data) {
    let {gmp} = this.context;
    return gmp.credential.create(data).then(response => {
      let credential = response.data;
      let {credentials = []} = this;
      credentials.push(credential);

      this.target_dialog.setValue('credentials', credentials);
      this.target_dialog.setValue(data.id_field, credential.id);
    });
  }

  handleCreatePortList(data) {
    let {gmp} = this.context;
    return gmp.portlist.create(data).then(response => {
      let portlist = response.data;
      let {port_lists = []} = this;
      port_lists.push(portlist);
      this.target_dialog.setValue('port_lists', port_lists);
      this.target_dialog.setValue('port_list_id', portlist.id);
    });
  }

  render() {
    return (
      <Layout>
        <TargetDialog
          ref={ref => this.target_dialog = ref}
          onNewCredentialsClick={this.openCredentialsDialog}
          onNewPortListClick={this.openPortListDialog}
          onSave={this.handleSaveTarget}
        />
        <CredentialsDialog
          ref={ref => this.credentials_dialog = ref}
          onSave={this.handleCreateCredential}
        />
        <PortListDialog
          ref={ref => this.port_list_dialog = ref}
          onSave={this.handleCreatePortList}
        />
      </Layout>
    );
  }
};

TargetDialogContainer.propTypes = {
  onSave: PropTypes.func,
};

TargetDialogContainer.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default TargetDialogContainer;

// vim: set ts=2 sw=2 tw=80:
