/* Copyright (C) 2017-2022 Greenbone AG
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

import React from 'react';

import {connect} from 'react-redux';

import _ from 'gmp/locale';
import {longDate} from 'gmp/locale/date';

import {filter, map} from 'gmp/utils/array';
import {hasValue, isDefined} from 'gmp/utils/identity';
import {selectSaveId} from 'gmp/utils/id';

import {parseInt} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

import withGmp from 'web/utils/withGmp';

import SaveDialog from 'web/components/dialog/savedialog';

import FootNote from 'web/components/footnote/footnote';

import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';
import TextField from 'web/components/form/textfield';

import KeyIcon from 'web/components/icon/keyicon';
import NewIcon from 'web/components/icon/newicon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import {getTimezone} from 'web/store/usersettings/selectors';

import {
  GREENBONE_SENSOR_SCANNER_TYPE,
  scannerTypeName,
} from 'gmp/models/scanner';

const AVAILABLE_SCANNER_TYPES = [GREENBONE_SENSOR_SCANNER_TYPE];

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
  host = 'localhost',
  id,
  name = _('Unnamed'),
  port = '22',
  title = _('New Scanner'),
  type,
  which_cert,
  onClose,
  onCredentialChange,
  onNewCredentialClick,
  onSave,
  onScannerTypeChange,
  ...props
}) => {
  // eslint-disable-next-line no-shadow
  const handleTypeChange = (value, name) => {
    if (onScannerTypeChange) {
      value = parseInt(value);
      const scan_credentials = filter(credentials);

      onScannerTypeChange(value, name);
      onScannerTypeChange(
        selectSaveId(scan_credentials, credential_id),
        'credential_id',
      );
    }
  };

  const data = {
    ca_pub,
    comment,
    host,
    id,
    name,
    port,
    which_cert,
  };

  let SCANNER_TYPES = [];

  const {gmp} = props;

  if (gmp.settings.enableGreenboneSensor) {
    type = hasValue(type) ? type : GREENBONE_SENSOR_SCANNER_TYPE;
    SCANNER_TYPES = [GREENBONE_SENSOR_SCANNER_TYPE];
  } else {
    type = hasValue(type) ? type : undefined;
    SCANNER_TYPES = [];
  }

  let {credential_id} = props;

  const scannerTypesOptions = map(SCANNER_TYPES, scannerType => ({
    label: scannerTypeName(scannerType),
    value: scannerType,
  }));

  const scanner_credentials = filter(credentials);
  const isInUse = isDefined(scanner) && scanner.isInUse();
  const show_cred_info = isDefined(scanner) && isDefined(scanner.credential);

  const isGreenboneSensorType = type === GREENBONE_SENSOR_SCANNER_TYPE;

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
  id: PropTypes.string,
  name: PropTypes.string,
  port: PropTypes.string,
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

export default withGmp(ScannerDialog);

// vim: set ts=2 sw=2 tw=80:
