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
import {is_defined, shorten, select_save_id} from '../../utils.js';

import Layout from '../components/layout/layout.js';

import PropTypes from '../proptypes.js';

import EntitiesPage from '../entities/page.js';
import {withEntitiesContainer} from '../entities/container.js';
import {createEntitiesFooter} from '../entities/footer.js';
import {createEntitiesHeader} from '../entities/header.js';
import {createEntitiesTable} from '../entities/table.js';

import Text from '../components/form/text.js';

import HelpIcon from '../icons/helpicon.js';
import NewIcon from '../icons/newicon.js';

import {createFilterDialog} from '../powerfilter/dialog.js';

import CredentialDialog from '../credentials/dialog.js';

import ScannerDialog from './dialog.js';
import Row from './row.js';

import {
  SLAVE_SCANNER_TYPE,
} from '../../gmp/models/scanner.js';

import {
  CLIENT_CERTIFICATE_CREDENTIAL_TYPE,
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
} from '../../gmp/models/credential.js';

const SORT_FIELDS = [
  ['name', _('Name')],
  ['host', _('Host')],
  ['port', _('Port')],
  ['type', _('Type')],
  ['credential', _('Credential')],
];

const ToolBarIcons = ({
    onNewScannerClick
  }, {capabilities}) => {
  return (
    <Layout flex>
      <HelpIcon
        page="scanners"
        title={_('Help: Scanners')}/>
      {capabilities.mayCreate('scanner') &&
        <NewIcon
          title={_('New Scanner')}
          onClick={onNewScannerClick}/>
      }
    </Layout>
  );
};

ToolBarIcons.propTypes = {
  onNewScannerClick: PropTypes.func,
};

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

class Page extends React.Component {

  constructor(...args) {
    super(...args);

    this.openCredentialDialog = this.openCredentialDialog.bind(this);
    this.openScannerDialog = this.openScannerDialog.bind(this);
    this.handleCreateCredential = this.handleCreateCredential.bind(this);
    this.handleVerifyScanner = this.handleVerifyScanner.bind(this);
  }

  openScannerDialog(scanner) {
    let {gmp} = this.context;
    let {entityCommand} = this.props;

    if (is_defined(scanner)) {
      entityCommand.get(scanner, {
        cache: false,
      }).then(response => {
        scanner = response.data;
        const state = {
          comment: scanner.comment,
          id: scanner.id,
          name: scanner.name,
          type: scanner.type,
          host: scanner.host,
          port: scanner.port,
          ca_pub: is_defined(scanner.ca_pub) ?
            scanner.ca_pub.certificate : undefined,
          scanner,
          which_cert: is_defined(scanner.ca_pub) ? 'existing' : 'default',
        };
        this.scanner_dialog.show(state, {
          title: _('Edit scanner {{name}}', {name: shorten(scanner.name)}),
        });
      });
    }
    else {
      this.scanner_dialog.show({});
    }

    gmp.credentials.getAll({cache: false}).then(credentials => {
      this.credentials = credentials;
      const credential_id = is_defined(scanner) &&
        is_defined(scanner.credential) ? scanner.credential.id : undefined;
      this.scanner_dialog.setValues({
        credentials,
        credential_id: select_save_id(credentials, credential_id),
      });
    });
  }

  openCredentialDialog(type) {
    const base = type === SLAVE_SCANNER_TYPE ?
      USERNAME_PASSWORD_CREDENTIAL_TYPE :
      CLIENT_CERTIFICATE_CREDENTIAL_TYPE;
    this.credential_dialog.show({types: [base], base});
  }

  handleVerifyScanner(scanner) {
    let {entityCommand, showSuccess, showError} = this.props;

    entityCommand.verify(scanner).then(() => {
      showSuccess(_('Scanner {{name}} verified successfully.',
        {name: scanner.name}));
    }, error => {
      showError(
        <Layout flex="column">
          <Text>
            {_('Scanner {{name}} could not be verified.',
              {name: scanner.name})}
          </Text>
          <Text>
            {error.message}
          </Text>
        </Layout>
        );
    });
  }

  handleCreateCredential(data) {
    let {gmp} = this.context;
    return gmp.credential.create(data).then(response => {
      let {credentials} = this;
      let credential = response.data;
      credentials.push(credential);
      this.scanner_dialog.setValues({
        credentials,
        credential_id: credential.id,
      });
    });
  }

  render() {
    let {onEntitySave} = this.props;
    return (
      <Layout>
        <EntitiesPage
          {...this.props}
          onEntityEdit={this.openScannerDialog}
          onVerifyScanner={this.handleVerifyScanner}
          onNewScannerClick={this.openScannerDialog}
        />
        <ScannerDialog
          ref={ref => this.scanner_dialog = ref}
          onNewCredentialClick={this.openCredentialDialog}
          onSave={onEntitySave}
        />
        <CredentialDialog
          ref={ref => this.credential_dialog = ref}
          onSave={this.handleCreateCredential}
        />
      </Layout>
    );
  }
}

Page.propTypes = {
  entityCommand: PropTypes.entitycommand,
  onChanged: PropTypes.func,
  onEntitySave: PropTypes.func,
  showError: PropTypes.func.isRequired,
  showSuccess: PropTypes.func.isRequired,
};

Page.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

const Table = createEntitiesTable({
  emptyTitle: _('No scanners available'),
  header: createEntitiesHeader(SORT_FIELDS),
  row: Row,
  footer: createEntitiesFooter({
    download: 'scanners.xml',
    span: 7,
    trash: true,
  }),
});

export default withEntitiesContainer(Page, 'scanner', {
  filterEditDialog: createFilterDialog({
    sortFields: SORT_FIELDS,
  }),
  sectionIcon: 'scanner.svg',
  table: Table,
  title: _('Scanners'),
  toolBarIcons: ToolBarIcons,
});

// vim: set ts=2 sw=2 tw=80:
