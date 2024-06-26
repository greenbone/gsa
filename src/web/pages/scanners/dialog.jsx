/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import _ from 'gmp/locale';

import {filter, map} from 'gmp/utils/array';
import {hasValue, isDefined} from 'gmp/utils/identity';

import {parseInt} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

import withGmp from 'web/utils/withGmp';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';
import TextField from 'web/components/form/textfield';

import NewIcon from 'web/components/icon/newicon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import {
  GREENBONE_SENSOR_SCANNER_TYPE,
  scannerTypeName,
} from 'gmp/models/scanner';

const AVAILABLE_SCANNER_TYPES = [GREENBONE_SENSOR_SCANNER_TYPE];

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

      onScannerTypeChange(value, name);
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
