/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import Select from 'web/components/form/select';
import TextField from 'web/components/form/textfield';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import {
  FULL_AND_FAST_SCAN_CONFIG_ID,
  EMPTY_SCAN_CONFIG_ID,
  BASE_SCAN_CONFIG_ID,
} from 'gmp/models/scanconfig';

const CreateScanConfigDialog = ({
  baseScanConfig = BASE_SCAN_CONFIG_ID,
  comment = '',
  name = _('Unnamed'),
  scannerId,
  scanners = [],
  title = _('New Scan Config'),
  onClose,
  onSave,
}) => {
  const defaultValues = {
    baseScanConfig,
    comment,
    name,
    scannerId,
  };
  return (
    <SaveDialog
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={defaultValues}
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

            <FormGroup title={_('Base')} flex="column">
              <Divider flex="column">
                <Radio
                  name="baseScanConfig"
                  value={BASE_SCAN_CONFIG_ID}
                  checked={state.baseScanConfig === BASE_SCAN_CONFIG_ID}
                  title={_('Base with a minimum set of NVTs')}
                  onChange={onValueChange}
                />
                <Radio
                  name="baseScanConfig"
                  value={EMPTY_SCAN_CONFIG_ID}
                  checked={state.baseScanConfig === EMPTY_SCAN_CONFIG_ID}
                  title={_('Empty, static and fast')}
                  onChange={onValueChange}
                />
                <Radio
                  name="baseScanConfig"
                  value={FULL_AND_FAST_SCAN_CONFIG_ID}
                  checked={
                    state.baseScanConfig === FULL_AND_FAST_SCAN_CONFIG_ID
                  }
                  title={_('Full and fast')}
                  onChange={onValueChange}
                />
                {scanners.length > 0 && (
                  <Divider>
                    <Radio
                      name="baseScanConfig"
                      value="0"
                      checked={state.baseScanConfig === '0'}
                      onChange={onValueChange}
                    />
                    <Select
                      value={state.scannerId}
                      name="scannerId"
                      items={renderSelectItems(scanners)}
                      onChange={onValueChange}
                    />
                  </Divider>
                )}
              </Divider>
            </FormGroup>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

CreateScanConfigDialog.propTypes = {
  baseScanConfig: PropTypes.oneOf([
    FULL_AND_FAST_SCAN_CONFIG_ID,
    EMPTY_SCAN_CONFIG_ID,
    BASE_SCAN_CONFIG_ID,
    '0',
  ]),
  comment: PropTypes.string,
  name: PropTypes.string,
  scannerId: PropTypes.id,
  scanners: PropTypes.array,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default CreateScanConfigDialog;

// vim: set ts=2 sw=2 tw=80:
