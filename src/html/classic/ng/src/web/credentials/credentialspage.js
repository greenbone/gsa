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
import {is_defined} from '../../utils.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';

import EntitiesPage from '../entities/page.js';
import {withEntitiesContainer} from '../entities/container.js';

import HelpIcon from '../icons/helpicon.js';
import NewIcon from '../icons/newicon.js';

import {ALL_CREDENTIAL_TYPES, USERNAME_PASSWORD_CREDENTIAL_TYPE,
  } from '../../gmp/models/credential.js';

import CredentialsDialog from './dialog.js';
import FilterDialog from './filterdialog.js';
import Table from './table.js';

const ToolBarIcons = ({
    onNewCredentialClick
  }, {capabilities}) => {
  return (
    <Layout flex>
      <HelpIcon
        page="credentials"
        title={_('Help: Credentials')}/>
      {capabilities.mayCreate('credential') &&
        <NewIcon
          title={_('New Credential')}
          onClick={onNewCredentialClick}/>
      }
    </Layout>
  );
};

ToolBarIcons.propTypes = {
  onNewCredentialClick: React.PropTypes.func,
};

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

class Page extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleSaveCredential = this.handleSaveCredential.bind(this);
    this.openCredentialsDialog = this.openCredentialsDialog.bind(this);
  }

  openCredentialsDialog(credential) {
    if (credential) {
      this.credentials_dialog.show({
        allow_insecure: credential.allow_insecure,
        auth_algorithm: credential.auth_algorithm,
        base: credential.type,
        comment: credential.comment,
        credential,
        credential_login: credential.login,
        id: credential.id,
        name: credential.name,
        privacy_algorithm: is_defined(credential.privacy) ?
          credential.privacy.algorithm : undefined,
        types: [credential.type],
      }, {
        title: _('Edit Credential {{name}}', {name: credential.name}),
      });
    }
    else {
      this.credentials_dialog.show({
        types: ALL_CREDENTIAL_TYPES,
        base: USERNAME_PASSWORD_CREDENTIAL_TYPE,
      });
    }
  }

  handleSaveCredential(data) {
    let {onChanged, entityCommand} = this.props;
    let promise;
    if (data.credential) {
      promise = entityCommand.save(data);
    }
    else {
      promise = entityCommand.create(data);
    }
    return promise.then(() => onChanged());
  }

  render() {
    return (
      <Layout>
        <EntitiesPage
          onEditCredential={this.openCredentialsDialog}
          onNewCredentialClick={this.openCredentialsDialog}
          {...this.props}
        />
        <CredentialsDialog
          ref={ref => this.credentials_dialog = ref}
          onSave={this.handleSaveCredential}
        />
      </Layout>
    );
  }
}

Page.propTypes = {
  entityCommand: PropTypes.entitycommand,
  onChanged: React.PropTypes.func.isRequired,
};

export default withEntitiesContainer(Page, 'credential', {
  filterEditDialog: FilterDialog,
  sectionIcon: 'credential.svg',
  table: Table,
  title: _('Credentials'),
  toolBarIcons: ToolBarIcons,
});

// vim: set ts=2 sw=2 tw=80:
