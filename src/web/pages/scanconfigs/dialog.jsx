/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import Select from 'web/components/form/select';
import TextField from 'web/components/form/textfield';

import Row from 'web/components/layout/row';

import {
  FULL_AND_FAST_SCAN_CONFIG_ID,
  EMPTY_SCAN_CONFIG_ID,
  BASE_SCAN_CONFIG_ID,
} from 'gmp/models/scanconfig';

import useTranslation from 'web/hooks/useTranslation';

const CreateScanConfigDialog = ({
  baseScanConfig = BASE_SCAN_CONFIG_ID,
  comment = '',
  name,
  scannerId,
  scanners = [],
  title,
  onClose,
  onSave,
}) => {
  const [_] = useTranslation();
  name = name || _('Unnamed');
  title = title || _('New Scan Config');
  const defaultValues = {
    baseScanConfig,
    comment,
    name,
    scannerId,
  };
  return (
    <SaveDialog
      width="auto"
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={defaultValues}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                value={state.name}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                value={state.comment}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Base')}>
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
                checked={state.baseScanConfig === FULL_AND_FAST_SCAN_CONFIG_ID}
                title={_('Full and fast')}
                onChange={onValueChange}
              />
              {scanners.length > 0 && (
                <Row>
                  <Radio
                    name="baseScanConfig"
                    value="0"
                    checked={state.baseScanConfig === '0'}
                    onChange={onValueChange}
                  />
                  <Select
                    grow="1"
                    value={state.scannerId}
                    name="scannerId"
                    items={renderSelectItems(scanners)}
                    onChange={onValueChange}
                  />
                </Row>
              )}
            </FormGroup>
          </>
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
