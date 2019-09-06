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

import React, {useState, useEffect} from 'react';

import _ from 'gmp/locale';

import {
  OPENVAS_SCAN_CONFIG_TYPE,
  OSP_SCAN_CONFIG_TYPE,
} from 'gmp/models/scanconfig';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';
import Select from 'web/components/form/select';
import Loading from 'web/components/loading/loading';

import Layout from 'web/components/layout/layout';

import NvtFamilies from './nvtfamilies';
import NvtPreferences from './nvtpreferences';
import ScannerPreferences from './scannerpreferences';

const createScannerPreferenceValues = (preferences = []) => {
  const values = {};

  preferences.forEach(preference => {
    values[preference.name] = preference.value;
  });

  return values;
};

const EditDialog = ({
  comment = '',
  config,
  configIsInUse = false,
  configType,
  editNvtDetailsTitle,
  families,
  name,
  nvtPreferences,
  scannerPreferences,
  scannerId,
  scanners,
  select,
  title,
  trend,
  onClose,
  onEditConfigFamilyClick,
  onEditNvtDetailsClick,
  onSave,
}) => {
  const [scannerPreferenceValues, setScannerPreferenceValues] = useState(
    createScannerPreferenceValues(scannerPreferences),
  );

  useEffect(() => {
    setScannerPreferenceValues(
      createScannerPreferenceValues(scannerPreferences),
    );
  }, [scannerPreferences]);

  const uncontrolledData = {
    comment,
    name,
    scannerId,
  };

  const controlledData = {
    id: config.id,
    scannerPreferenceValues,
    select,
    trend,
  };

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    // we want to show loading indicator while the content of the dialog is loading. 500ms is arbitrary, but the loading indicator will not disappear until rerender with the required content.
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <SaveDialog
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={uncontrolledData}
      values={controlledData}
    >
      {({values: state, onValueChange}) => {
        if (isLoading) {
          return <Loading />;
        }

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

            {!configIsInUse && (
              <React.Fragment>
                {configType === OSP_SCAN_CONFIG_TYPE && (
                  <FormGroup title={_('Scanner')}>
                    <Select
                      name="scannerId"
                      items={renderSelectItems(scanners)}
                      value={state.scannerId}
                      onChange={onValueChange}
                    />
                  </FormGroup>
                )}

                {configType === OPENVAS_SCAN_CONFIG_TYPE && (
                  <NvtFamilies
                    config={config}
                    families={families}
                    trend={trend}
                    select={select}
                    onEditConfigFamilyClick={onEditConfigFamilyClick}
                    onValueChange={onValueChange}
                  />
                )}

                <ScannerPreferences
                  values={scannerPreferenceValues}
                  preferences={scannerPreferences}
                  onValuesChange={values => setScannerPreferenceValues(values)}
                />

                {configType === OPENVAS_SCAN_CONFIG_TYPE && (
                  <NvtPreferences
                    editTitle={editNvtDetailsTitle}
                    preferences={nvtPreferences}
                    onEditNvtDetailsClick={onEditNvtDetailsClick}
                  />
                )}
              </React.Fragment>
            )}
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

EditDialog.propTypes = {
  comment: PropTypes.string,
  config: PropTypes.model.isRequired,
  configIsInUse: PropTypes.bool,
  configType: PropTypes.number,
  editNvtDetailsTitle: PropTypes.string,
  families: PropTypes.array,
  name: PropTypes.string,
  nvtPreferences: PropTypes.arrayOf(PropTypes.object),
  scannerId: PropTypes.id,
  scannerPreferences: PropTypes.arrayOf(PropTypes.object),
  scanners: PropTypes.array,
  select: PropTypes.object,
  title: PropTypes.string.isRequired,
  trend: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onEditConfigFamilyClick: PropTypes.func,
  onEditNvtDetailsClick: PropTypes.func,
  onSave: PropTypes.func.isRequired,
};

export default EditDialog;

// vim: set ts=2 sw=2 tw=80:
