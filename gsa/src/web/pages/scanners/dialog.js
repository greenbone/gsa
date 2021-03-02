/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import React, {useCallback} from 'react';

import {connect} from 'react-redux';

import _ from 'gmp/locale';
import {longDate} from 'gmp/locale/date';

import {
  OSP_SCANNER_TYPE,
  GREENBONE_SENSOR_SCANNER_TYPE,
  scannerTypeName,
} from 'gmp/models/scanner';

import {CLIENT_CERTIFICATE_CREDENTIAL_TYPE} from 'gmp/models/credential';

import {parseInt} from 'gmp/parser';

import {filter, map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {selectSaveId} from 'gmp/utils/id';

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

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';
import useGmp from 'web/utils/useGmp';

const AVAILABLE_SCANNER_TYPES = [
  OSP_SCANNER_TYPE,
  GREENBONE_SENSOR_SCANNER_TYPE,
];

const client_cert_credentials_filter = credential => {
  return credential.credential_type === CLIENT_CERTIFICATE_CREDENTIAL_TYPE;
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

const ScannerDialog = ({
  ca_pub,
  comment = '',
  scanner,
  credentials,
  credential_id,
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
  onScannerTypeChange,
}) => {
  const gmp = useGmp();

  const handleTypeChange = useCallback(
    newScannerType => {
      if (onScannerTypeChange) {
        newScannerType = parseInt(newScannerType);
        const scan_credentials = filter(
          credentials,
          client_cert_credentials_filter,
        );
        const credentialId = selectSaveId(scan_credentials, credential_id);

        onScannerTypeChange(newScannerType, credentialId);
      }
    },
    [onScannerTypeChange, credentials, credential_id],
  );

  const data = {
    ca_pub,
    comment,
    host,
    id,
    name,
    port,
    which_cert,
  };

  let SCANNER_TYPES;

  if (gmp.settings.enableGreenboneSensor) {
    SCANNER_TYPES = [OSP_SCANNER_TYPE, GREENBONE_SENSOR_SCANNER_TYPE];
  } else {
    SCANNER_TYPES = [OSP_SCANNER_TYPE];
  }

  const scannerTypesOptions = map(SCANNER_TYPES, scannerType => ({
    label: scannerTypeName(scannerType),
    value: scannerType,
  }));

  const scanner_credentials = filter(
    credentials,
    client_cert_credentials_filter,
  );
  const is_edit = isDefined(scanner);
  const isInUse = isDefined(scanner) && scanner.isInUse();
  const show_cred_info =
    isDefined(scanner) &&
    isDefined(scanner.credential) &&
    scanner.credential.credential_type === CLIENT_CERTIFICATE_CREDENTIAL_TYPE;

  const isGreenboneSensorType = type === GREENBONE_SENSOR_SCANNER_TYPE;
  const isOspScannerType = type === OSP_SCANNER_TYPE;

  if (isGreenboneSensorType) {
    credential_id = '';
  }

  return (
    <SaveDialog // the dialog current changes sizes based on content. For the future we should somehow fix the size to prevent jumping around.
      defaultValues={data}
      title={title}
      values={{
        credential_id,
        type,
      }}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <Layout flex="column">
            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                grow="1"
                value={state.name}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                value={state.comment}
                grow="1"
                onChange={onValueChange}
              />
            </FormGroup>
            <FormGroup title={_('Type')}>
              <Select
                name="type"
                value={state.type}
                items={scannerTypesOptions}
                disabled={isInUse}
                onChange={handleTypeChange}
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

            {isOspScannerType && (
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
                    <CertStatus info={state.ca_pub_info} />
                  )}
                </FormGroup>
              </React.Fragment>
            )}

            {!isGreenboneSensorType && (
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
            )}
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

ScannerDialog.propTypes = {
  ca_pub: PropTypes.string,
  comment: PropTypes.string,
  credential_id: PropTypes.id,
  credentials: PropTypes.array,
  gmp: PropTypes.gmp,
  host: PropTypes.string,
  id: PropTypes.id,
  name: PropTypes.string,
  port: PropTypes.number,
  scanner: PropTypes.model,
  title: PropTypes.string,
  type: PropTypes.oneOf(AVAILABLE_SCANNER_TYPES),
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
