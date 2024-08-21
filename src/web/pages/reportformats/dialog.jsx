/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import FileField from 'web/components/form/filefield';
import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';
import YesNoRadio from 'web/components/form/yesnoradio';

import Layout from 'web/components/layout/layout';

class Dialog extends React.Component {
  constructor(...args) {
    super(...args);
  }
  render() {
    const {
      reportformat,
      title = _('Import Report Format'),
      onClose,
      onSave,
    } = this.props;

    if (isDefined(reportformat)) {
      return (
        <SaveDialog
          title={title}
          onClose={onClose}
          onSave={onSave}
          defaultValues={reportformat}
        >
          {({values: state, onValueChange}) => {
            return (
              <Layout flex="column">
                <FormGroup title={_('Name')}>
                  <TextField
                    grow="1"
                    name="name"
                    value={state.name}
                    onChange={onValueChange}
                  />
                </FormGroup>

                <FormGroup title={_('Summary')}>
                  <TextField
                    grow="1"
                    name="summary"
                    value={state.summary}
                    onChange={onValueChange}
                  />
                </FormGroup>

                <FormGroup title={_('Active')}>
                  <YesNoRadio
                    name="active"
                    value={state.active}
                    onChange={onValueChange}
                  />
                </FormGroup>
              </Layout>
            );
          }}
        </SaveDialog>
      );
    }
    return (
      <SaveDialog title={title} onClose={onClose} onSave={onSave}>
        {({values: state, onValueChange}) => {
          return (
            <Layout flex="column">
              <FormGroup title={_('Import XML Report Format')} titleSize="3">
                <FileField name="xml_file" onChange={onValueChange} />
              </FormGroup>
            </Layout>
          );
        }}
      </SaveDialog>
    );
  }
}

Dialog.propTypes = {
  active: PropTypes.yesno,
  formats: PropTypes.array,
  id_lists: PropTypes.object,
  name: PropTypes.string,
  preferences: PropTypes.object,
  reportformat: PropTypes.model,
  summary: PropTypes.string,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onValueChange: PropTypes.func,
};

export default Dialog;

// vim: set ts=2 sw=2 tw=80:
