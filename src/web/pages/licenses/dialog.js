/* Copyright (C) 2021 Greenbone Networks GmbH
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
import React, {useState} from 'react';

import _ from 'gmp/locale';

import ConfirmationDialog from 'web/components/dialog/confirmationdialog';
import SaveDialog from 'web/components/dialog/savedialog';

import FileField from 'web/components/form/filefield';
import FormGroup from 'web/components/form/formgroup';

import PropTypes from 'web/utils/proptypes';

const LicenseDialog = ({
  error,
  license,
  onClose,
  onErrorClose,
  onSave,
  onValueChange,
}) => {
  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    useState(false);
  const closeConfirmationDialog = () => {
    setConfirmationDialogVisible(false);
  };

  const handleSaveClick = data => {
    setConfirmationDialogVisible(true);
  };
  const handleResumeClick = data => {
    closeConfirmationDialog();
    onSave(data);
  };
  return (
    <SaveDialog
      error={error}
      title={_('New License')}
      onClose={onClose}
      onErrorClose={onErrorClose}
      onSave={data => handleSaveClick(onSave, data)}
    >
      {({values}) => (
        <React.Fragment>
          <FormGroup title={_('License File')}>
            <FileField name="file" onChange={onValueChange} />
          </FormGroup>
          {confirmationDialogVisible && (
            <ConfirmationDialog
              content={_(
                'Please note: You are about to change your license! ' +
                  'This might have severe influence on the feature set ' +
                  'available to you. Are you sure you want to continue?',
              )}
              title={_('Change License?')}
              width="400px"
              onClose={closeConfirmationDialog}
              onResumeClick={handleResumeClick}
            />
          )}
        </React.Fragment>
      )}
    </SaveDialog>
  );
};

LicenseDialog.propTypes = {
  error: PropTypes.string,
  license: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onErrorClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onValueChange: PropTypes.func,
};

export default LicenseDialog;

// vim: set ts=2 sw=2 tw=80:
