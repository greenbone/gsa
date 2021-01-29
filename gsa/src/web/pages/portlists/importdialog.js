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
import React from 'react';

import _ from 'gmp/locale';

import SaveDialog from 'web/components/dialog/savedialog';

import FileField from 'web/components/form/filefield';
import FormGroup from 'web/components/form/formgroup';

import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';

const ImportDialog = ({onClose, onSave}) => {
  return (
    <SaveDialog
      buttonTitle={_('Import')}
      title={_('Import Port List')}
      onClose={onClose}
      onSave={onSave}
    >
      {({onValueChange}) => {
        return (
          <Layout flex="column">
            <FormGroup title={_('Import XML Port List')} titleSize="3">
              <FileField name="xml_file" onChange={onValueChange} />
            </FormGroup>
          </Layout>
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

// vim: set ts=2 sw=2 tw=80:
