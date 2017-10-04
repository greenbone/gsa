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

import _ from 'gmp/locale.js';
import {first, is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import Layout from '../../components/layout/layout.js';
import withEntityComponent, {
  create_handler_props,
  has_mapping,
} from '../../entity/withEntityComponent.js';

import CredentialsDialog from '../credentials/dialog.js';

import PortListDialog from '../portlists/dialog.js';

import TargetDialog from './dialog.js';

const id_or__ = value => {
  return is_defined(value) ? value.id : 0;
};

const DEFAULT_MAPPING = {
  onClone: 'onTargetCloneClick',
  onCloned: 'onCloned',
  onCreate: 'onTargetCreateClick',
  onCreated: 'onCreated',
  onCreateError: undefined, // let dialog handle error via returned promise
  onDelete: 'onTargetDeleteClick',
  onDeleted: 'onDeleted',
  onSave: 'onTargetSaveClick',
  onSaved: 'onSaved',
  onSaveError: undefined, // same as onCreateError
  onDownload: 'onTargetDownloadClick',
  onDownloaded: 'onDownloaded',
  onEdit: 'onTargetEditClick',
};

const withTargetComponent = (mapping = {}) => Component => {

  mapping = {
    ...DEFAULT_MAPPING,
    ...mapping,
  };

  class TargetComponentWrapper extends React.Component {

    constructor(...args) {
      super(...args);

      this.openCredentialsDialog = this.openCredentialsDialog.bind(this);
      this.openPortListDialog = this.openPortListDialog.bind(this);
      this.openTargetDialog = this.openTargetDialog.bind(this);
      this.openCreateTargetDialog = this.openCreateTargetDialog.bind(this);
      this.handleCreateCredential = this.handleCreateCredential.bind(this);
      this.handleCreatePortList = this.handleCreatePortList.bind(this);
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

    openTargetDialog(entity) {
      if (is_defined(entity)) {
        this.target_dialog.show({
          id: entity.id,
          alive_tests: entity.alive_tests,
          comment: entity.comment,
          esxi_credential_id: id_or__(entity.esxi_credential),
          exclude_hosts: is_defined(entity.exclude_hosts) ?
            entity.exclude_hosts.join(', ') : '',
          hosts: entity.hosts.join(', '),
          in_use: entity.isInUse(),
          name: entity.name,
          port_list_id: id_or__(entity.port_list),
          port: is_defined(entity.ssh_credential) ?
            entity.ssh_credential.port : '22',
          reverse_lookup_only: entity.reverse_lookup_only,
          reverse_lookup_unify: entity.reverse_lookup_unify,
          smb_credential_id: id_or__(entity.smb_credential),
          snmp_credential_id: id_or__(entity.snmp_credential),
          ssh_credential_id: id_or__(entity.ssh_credential),
          target_source: 'manual',
          target_exclude_source: 'manual',
        }, {
          title: _('Edit Target {{name}}', entity),
        });

        this.loadData();
      }
    }

    openCreateTargetDialog(initial = {}) {
      this.target_dialog.show(initial);

      this.loadData();
    }

    loadData() {
      const {gmp} = this.context;

      gmp.portlists.getAll().then(port_lists => {
        this.port_lists = port_lists;
        this.target_dialog.setValues({port_lists});
      });

      gmp.credentials.getAll().then(credentials => {
        this.credentials = credentials;
        this.target_dialog.setValues({credentials});
      });
    }

    openPortListDialog() {
      this.port_list_dialog.show({});
    }

    handleCreateCredential(data) {
      const {gmp} = this.context;
      return gmp.credential.create(data).then(response => {
        const credential = response.data;
        const {credentials = []} = this;
        credentials.push(credential);

        this.target_dialog.setValues({
          credentials,
          [data.id_field]: credential.id,
        });
      });
    }

    handleCreatePortList(data) {
      const {gmp} = this.context;
      return gmp.portlist.create(data).then(response => {
        const portlist = response.data;
        const {port_lists = []} = this;
        port_lists.push(portlist);
        this.target_dialog.setValues({
          port_lists,
          port_list_id: portlist.id,
        });
      });
    }

    render() {
      const {
        onSave,
      } = mapping;

      const onSaveHandler = this.props[onSave];

      const has_save = is_defined(onSaveHandler) &&
        has_mapping(this.props, mapping, 'onSaved');
      const has_create = is_defined(onSaveHandler) &&
        has_mapping(this.props, mapping, 'onCreated');

      const handlers = create_handler_props(this.props, mapping)
        .set('onEdit', has_save, this.openTargetDialog)
        .set('onCreate', has_create, this.openCreateTargetDialog);

      return (
        <Layout>
          <Component
            {...this.props}
            {...handlers}
          />
          <TargetDialog
            ref={ref => this.target_dialog = ref}
            onNewCredentialsClick={this.openCredentialsDialog}
            onNewPortListClick={this.openPortListDialog}
            onSave={onSaveHandler}
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

  TargetComponentWrapper.propTypes = {
    onError: PropTypes.func.isRequired,
  };

  TargetComponentWrapper.contextTypes = {
    gmp: PropTypes.gmp.isRequired,
  };

  return withEntityComponent('target', mapping)(TargetComponentWrapper);
};

export default withTargetComponent;

// vim: set ts=2 sw=2 tw=80:
