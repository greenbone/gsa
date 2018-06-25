/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale';
import {longDate} from 'gmp/locale/date';

import {filter, map} from 'gmp/utils/array';
import {is_defined} from 'gmp/utils/identity';
import {select_save_id} from 'gmp/utils/id';

import {parse_int} from 'gmp/parser';

import PropTypes from '../../utils/proptypes.js';
import {render_select_items} from '../../utils/render.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import FootNote from '../../components/footnote/footnote.js';

import FileField from '../../components/form/filefield.js';
import FormGroup from '../../components/form/formgroup.js';
import Radio from '../../components/form/radio.js';
import Select from '../../components/form/select.js';
import Text from '../../components/form/text.js';
import TextField from '../../components/form/textfield.js';

import Icon from '../../components/icon/icon.js';
import NewIcon from '../../components/icon/newicon.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import {
  OSP_SCANNER_TYPE,
  SLAVE_SCANNER_TYPE,
  scanner_type_name,
} from 'gmp/models/scanner.js';

import {
  CLIENT_CERTIFICATE_CREDENTIAL_TYPE,
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
} from 'gmp/models/credential.js';

const scanner_types = [
  SLAVE_SCANNER_TYPE,
  OSP_SCANNER_TYPE,
];

const scannerTypesOptions = map(scanner_types, scannerType => ({
  label: scanner_type_name(scannerType),
  value: scannerType,
}));

const client_cert_credentials_filter = credential => {
  return credential.credential_type === CLIENT_CERTIFICATE_CREDENTIAL_TYPE;
};

const username_password_credentials_filter = credential => {
  return credential.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE;
};

const filter_credentials = (credentials, type) => {
  const cred_filter = type === SLAVE_SCANNER_TYPE ?
    username_password_credentials_filter :
    client_cert_credentials_filter;
  return filter(credentials, cred_filter);
};

const render_certificate_info = info => {
  if (!is_defined(info)) {
    return null;
  }

  if (info.time_status === 'expired') {
    return _('Certificate currently in use expired at {{date}}',
      {date: longDate(info.expiration_time)});
  }
  if (info.time_status === 'inactive') {
    return _('Certificate currently in not valid until {{date}}',
      {date: longDate(info.activation_time)});
  }
  return _('Certificate in use will expire at {{date}}',
      {date: longDate(info.expiration_time)});
};

const CertStatus = ({
    info,
  }) => {
  return (
    <FootNote flex box>
      <Layout flex box>
        <Icon img="key.svg"/>
      </Layout>
      <Text>
        {render_certificate_info(info)}
      </Text>
    </FootNote>
  );
};

CertStatus.propTypes = {
  info: PropTypes.object.isRequired,
};


class ScannerDialog extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleTypeChange = this.handleTypeChange.bind(this);
  }

  handleTypeChange(value, name) {
    const {credentials, credential_id, onScannerTypeChange} = this.props;

    if (onScannerTypeChange) {
      value = parse_int(value);
      const scan_credentials = filter_credentials(credentials, value);

      onScannerTypeChange(value, name);
      onScannerTypeChange(select_save_id(scan_credentials, credential_id),
        'credential_id');
    }
  }

  render() {
    const {
      ca_pub,
      comment = '',
      scanner,
      credential_id,
      credentials,
      host = 'localhost',
      id,
      name = _('Unnamed'),
      port = '9391',
      title = _('New Scanner'),
      type = OSP_SCANNER_TYPE,
      visible = true,
      which_cert,
      onClose,
      onCredentialChange,
      onNewCredentialClick,
      onSave,
    } = this.props;

    const data = {
      ca_pub,
      comment,
      host,
      id,
      name,
      port,
      which_cert,
    };

    const scanner_credentials = filter_credentials(credentials, type);
    const is_edit = is_defined(scanner);
    const in_use = is_defined(scanner) && scanner.isInUse();
    const show_cred_info = is_defined(scanner) &&
      is_defined(scanner.credential) &&
      scanner.credential.type === CLIENT_CERTIFICATE_CREDENTIAL_TYPE;

    return (
      <SaveDialog
        visible={visible}
        title={title}
        onClose={onClose}
        onSave={onSave}
        defaultValues={data}
        values={{
          credential_id,
          type,
        }}
      >
        {({
          values: state,
          onValueChange,
        }) => {
          return (
            <Layout flex="column">

              <FormGroup title={_('Name')}>
                <TextField
                  name="name"
                  grow="1"
                  value={state.name}
                  size="30"
                  onChange={onValueChange}
                  maxLength="80"/>
              </FormGroup>

              <FormGroup title={_('Comment')}>
                <TextField
                  name="comment"
                  value={state.comment}
                  grow="1"
                  size="30"
                  maxLength="400"
                  onChange={onValueChange}/>
              </FormGroup>

              <FormGroup title={_('Host')}>
                <TextField
                  name="host"
                  value={state.host}
                  disabled={in_use}
                  grow="1"
                  onChange={onValueChange}/>
              </FormGroup>

              <FormGroup title={_('Port')}>
                <TextField
                  name="port"
                  value={state.port}
                  disabled={in_use}
                  grow="1"
                  onChange={onValueChange}/>
              </FormGroup>

              <FormGroup title={_('Type')}>
                <Select
                  name="type"
                  value={state.type}
                  items={scannerTypesOptions}
                  disabled={in_use}
                  onChange={this.handleTypeChange}
                />
              </FormGroup>

              <FormGroup title={_('CA Certificate')} flex="column">
                <Layout flex box>
                  <Divider>
                    {is_edit &&
                      <Layout flex box>
                        {is_defined(state.ca_pub) &&
                          <Radio
                            title={_('Existing')}
                            name="which_cert"
                            value="existing"
                            checked={state.which_cert === 'existing'}
                            onChange={onValueChange}
                          />
                        }
                        <Radio
                          title={_('Default')}
                          name="which_cert"
                          value="default"
                          checked={state.which_cert === 'default'}
                          onChange={onValueChange}
                        />
                        <Radio
                          title={_('New:')}
                          name="which_cert"
                          value="new"
                          checked={state.which_cert === 'new'}
                          onChange={onValueChange}
                        />
                      </Layout>
                    }
                    <FileField
                      disabled={is_edit && state.which_cert !== 'new'}
                      name="ca_pub"
                      onChange={onValueChange}/>
                  </Divider>
                </Layout>
                {is_edit && is_defined(state.ca_pub) &&
                  <CertStatus info={state.ca_pub.info}/>
                }
              </FormGroup>

              <FormGroup title={_('Credential')} flex="column">
                <Divider>
                  <Select
                    name="credential_id"
                    items={render_select_items(scanner_credentials)}
                    value={credential_id}
                    onChange={onCredentialChange}/>
                  <Layout flex box>
                    <NewIcon
                      value={type}
                      title={_('Create a new Credential')}
                      onClick={onNewCredentialClick}/>
                  </Layout>
                </Divider>
                {show_cred_info &&
                  <CertStatus info={scanner.credential.certificate_info}/>
                }
              </FormGroup>

            </Layout>
          );
        }}
      </SaveDialog>
    );
  }
}

ScannerDialog.propTypes = {
  ca_pub: PropTypes.string,
  comment: PropTypes.string,
  credential_id: PropTypes.id,
  credentials: PropTypes.array,
  host: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  port: PropTypes.string,
  scanner: PropTypes.model,
  title: PropTypes.string,
  type: PropTypes.oneOf(scanner_types),
  visible: PropTypes.bool,
  which_cert: PropTypes.oneOf([
    'default', 'existing', 'new',
  ]),
  onClose: PropTypes.func.isRequired,
  onCredentialChange: PropTypes.func.isRequired,
  onNewCredentialClick: PropTypes.func,
  onSave: PropTypes.func.isRequired,
  onScannerTypeChange: PropTypes.func.isRequired,
  onValueChange: PropTypes.func,
};

export default ScannerDialog;

// vim: set ts=2 sw=2 tw=80:
