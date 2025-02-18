/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  FULL_AND_FAST_SCAN_CONFIG_ID,
  EMPTY_SCAN_CONFIG_ID,
  BASE_SCAN_CONFIG_ID,
} from 'gmp/models/scanconfig';
import React from 'react';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import Radio from 'web/components/form/Radio';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {renderSelectItems} from 'web/utils/Render';

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
      defaultValues={defaultValues}
      title={title}
      width="auto"
      onClose={onClose}
      onSave={onSave}
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
                checked={state.baseScanConfig === BASE_SCAN_CONFIG_ID}
                name="baseScanConfig"
                title={_('Base with a minimum set of NVTs')}
                value={BASE_SCAN_CONFIG_ID}
                onChange={onValueChange}
              />
              <Radio
                checked={state.baseScanConfig === EMPTY_SCAN_CONFIG_ID}
                name="baseScanConfig"
                title={_('Empty, static and fast')}
                value={EMPTY_SCAN_CONFIG_ID}
                onChange={onValueChange}
              />
              <Radio
                checked={state.baseScanConfig === FULL_AND_FAST_SCAN_CONFIG_ID}
                name="baseScanConfig"
                title={_('Full and fast')}
                value={FULL_AND_FAST_SCAN_CONFIG_ID}
                onChange={onValueChange}
              />
              {scanners.length > 0 && (
                <Row>
                  <Radio
                    checked={state.baseScanConfig === '0'}
                    name="baseScanConfig"
                    value="0"
                    onChange={onValueChange}
                  />
                  <Select
                    grow="1"
                    items={renderSelectItems(scanners)}
                    name="scannerId"
                    value={state.scannerId}
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
