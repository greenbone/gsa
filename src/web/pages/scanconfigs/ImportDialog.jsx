/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FileField from 'web/components/form/FileField';
import FormGroup from 'web/components/form/FormGroup';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const ImportDialog = ({title, text, onClose, onSave}) => {
  const [_] = useTranslation();
  return (
    <SaveDialog
      buttonTitle={_('Import')}
      title={title}
      width="500"
      onClose={onClose}
      onSave={onSave}
    >
      {({onValueChange}) => (
        <FormGroup title={text}>
          <FileField grow="1" name="xml_file" onChange={onValueChange} />
        </FormGroup>
      )}
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
