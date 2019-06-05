/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import {connect} from 'react-redux';

import _ from 'gmp/locale';
import {longDate} from 'gmp/locale/date';

import {filter, map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {selectSaveId} from 'gmp/utils/id';

import {parseInt} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

import SaveDialog from 'web/components/dialog/savedialog';

import FootNote from 'web/components/footnote/footnote';

import FileField from 'web/components/form/filefield';
import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import Select from 'web/components/form/select';
import TextField from 'web/components/form/textfield';

import KeyIcon from 'web/components/icon/keyicon';
import NewIcon from 'web/components/icon/newicon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import {getTimezone} from 'web/store/usersettings/selectors';

import {
  OSP_SCANNER_TYPE,
  GMP_SCANNER_TYPE,
  scannerTypeName,
} from 'gmp/models/scanner';

import {
  CLIENT_CERTIFICATE_CREDENTIAL_TYPE,
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
} from 'gmp/models/credential';

const SCANNER_TYPES = [GMP_SCANNER_TYPE, OSP_SCANNER_TYPE];

const client_cert_credentials_filter = credential => {
  return credential.credential_type === CLIENT_CERTIFICATE_CREDENTIAL_TYPE;
};

const username_password_credentials_filter = credential => {
  return credential.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE;
};

const filter_credentials = (credentials, type) => {
  const cred_filter =
    type === GMP_SCANNER_TYPE
      ? username_password_credentials_filter
      : client_cert_credentials_filter;
  return filter(credentials, cred_filter);
};

const render_certificate_info = (info, tz) => {
  if (!isDefined(info)) {
    return null;
  }

  if (info.time_status === 'expired') {
    return _('Certificate currently in use expired at {{date}}', {
      date: longDate(info.expirationTime, tz),
    });
  }
  if (info.time_status === 'inactive') {
    return _('Certificate currently not valid until {{date}}', {
      date: longDate(info.activationTime, tz),
    });
  }
  return _('Certificate in use will expire at {{date}}', {
    date: longDate(info.expirationTime, tz),
  });
};

const mapStateToProps = rootState => ({
  timezone: getTimezone(rootState),
});

const CertStatus = connect(mapStateToProps)(({info, timezone}) => {
  return (
    <FootNote>
      <Layout>
        <KeyIcon />
      </Layout>
      <span>{render_certificate_info(info, timezone)}</span>
    </FootNote>
  );
});

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
      value = parseInt(value);
      const scan_credentials = filter_credentials(credentials, value);

      onScannerTypeChange(value, name);
      onScannerTypeChange(
        selectSaveId(scan_credentials, credential_id),
        'credential_id',
      );
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

    const scannerTypesOptions = map(SCANNER_TYPES, scannerType => ({
      label: scannerTypeName(scannerType),
      value: scannerType,
    }));

    const scanner_credentials = filter_credentials(credentials, type);
    const is_edit = isDefined(scanner);
    const isInUse = isDefined(scanner) && scanner.isInUse();
    const show_cred_info =
      isDefined(scanner) &&
      isDefined(scanner.credential) &&
      scanner.credential.type === CLIENT_CERTIFICATE_CREDENTIAL_TYPE;
    const isGmpScannerType = type === GMP_SCANNER_TYPE;

    return (
      <SaveDialog
        title={title}
        onClose={onClose}
        onSave={onSave}
        defaultValues={data}
        values={{
          credential_id,
          type,
        }}
      >
        {({values: state, onValueChange}) => {
          return (
            <Layout flex="column">
              <FormGroup title={_('Name')}>
                <TextField
                  name="name"
                  grow="1"
                  value={state.name}
                  size="30"
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup title={_('Comment')}>
                <TextField
                  name="comment"
                  value={state.comment}
                  grow="1"
                  size="30"
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup title={_('Type')}>
                <Select
                  name="type"
                  value={state.type}
                  items={scannerTypesOptions}
                  disabled={isInUse}
                  onChange={this.handleTypeChange}
                />
              </FormGroup>

              <FormGroup title={_('Host')}>
                <TextField
                  name="host"
                  value={state.host}
                  disabled={isInUse}
                  grow="1"
                  onChange={onValueChange}
                />
              </FormGroup>

              {!isGmpScannerType && (
                <React.Fragment>
                  <FormGroup title={_('Port')}>
                    <TextField
                      name="port"
                      value={state.port}
                      disabled={isInUse}
                      grow="1"
                      onChange={onValueChange}
                    />
                  </FormGroup>

                  <FormGroup title={_('CA Certificate')} flex="column">
                    <Layout>
                      <Divider>
                        {is_edit && (
                          <Layout>
                            {isDefined(state.ca_pub) && (
                              <Radio
                                title={_('Existing')}
                                name="which_cert"
                                value="existing"
                                checked={state.which_cert === 'existing'}
                                onChange={onValueChange}
                              />
                            )}
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
                        )}
                        <FileField
                          disabled={is_edit && state.which_cert !== 'new'}
                          name="ca_pub"
                          onChange={onValueChange}
                        />
                      </Divider>
                    </Layout>
                    {is_edit && isDefined(state.ca_pub) && (
                      <CertStatus info={state.ca_pub.info} />
                    )}
                  </FormGroup>
                </React.Fragment>
              )}

              <FormGroup title={_('Credential')} flex="column">
                <Divider>
                  <Select
                    name="credential_id"
                    items={renderSelectItems(scanner_credentials)}
                    value={credential_id}
                    onChange={onCredentialChange}
                  />
                  <Layout>
                    <NewIcon
                      value={type}
                      title={_('Create a new Credential')}
                      onClick={onNewCredentialClick}
                    />
                  </Layout>
                </Divider>
                {show_cred_info && (
                  <CertStatus info={scanner.credential.certificate_info} />
                )}
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
  type: PropTypes.oneOf(SCANNER_TYPES),
  which_cert: PropTypes.oneOf(['default', 'existing', 'new']),
  onClose: PropTypes.func.isRequired,
  onCredentialChange: PropTypes.func.isRequired,
  onNewCredentialClick: PropTypes.func,
  onSave: PropTypes.func.isRequired,
  onScannerTypeChange: PropTypes.func.isRequired,
  onValueChange: PropTypes.func,
};

export default ScannerDialog;

// vim: set ts=2 sw=2 tw=80:
