/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import React from 'react';

import _ from 'gmp/locale.js';

import PropTypes from '../../utils/proptypes.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import FileField from '../../components/form/filefield.js';
import FormGroup from '../../components/form/formgroup.js';

import Layout from '../../components/layout/layout.js';

const ImportDialog = ({
  visible,
  onClose,
  onSave,
}) => {
  return (
    <SaveDialog
      buttonTitle={_('Import')}
      visible={visible}
      title={_('Import Port List')}
      onClose={onClose}
      onSave={onSave}
    >
      {({
        data: state,
        onValueChange,
      }) => {
        return (
          <Layout flex="column">
            <FormGroup
              title={_('Import XML Port List')}
              titleSize="3">
              <FileField
                name="xml_file"
                onChange={onValueChange}/>
            </FormGroup>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

ImportDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ImportDialog;

// vim: set ts=2 sw=2 tw=80:
