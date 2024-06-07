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

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import FileField from 'web/components/form/filefield';
import FormGroup from 'web/components/form/formgroup';

import useTranslation from 'web/hooks/useTranslation';

const ImportDialog = ({onClose, onSave}) => {
  const [_] = useTranslation();
  return (
    <SaveDialog
      buttonTitle={_('Import')}
      title={_('Import Port List')}
      onClose={onClose}
      onSave={onSave}
    >
      {({onValueChange}) => {
        return (
          <FormGroup title={_('Import XML Port List')}>
            <FileField name="xml_file" onChange={onValueChange} />
          </FormGroup>
        );
      }}
    </SaveDialog>
  );
};

ImportDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ImportDialog;
