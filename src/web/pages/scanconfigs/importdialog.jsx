/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import FileField from 'web/components/form/filefield';
import FormGroup from 'web/components/form/formgroup';

import Layout from 'web/components/layout/layout';

const ImportDialog = ({title, text, onClose, onSave}) => {
  return (
    <SaveDialog
      buttonTitle={_('Import')}
      title={title}
      width="500"
      onClose={onClose}
      onSave={onSave}
    >
      {({onValueChange}) => {
        return (
          <Layout flex="column">
            <FormGroup title={text} titleSize="4">
              <FileField name="xml_file" onChange={onValueChange} />
            </FormGroup>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

ImportDialog.propTypes = {
  text: PropTypes.string,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ImportDialog;

// vim: set ts=2 sw=2 tw=80:
