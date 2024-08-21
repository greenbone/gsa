/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import Layout from 'web/components/layout/layout';

import SaveDialog from 'web/components/dialog/savedialog';

import PropTypes from 'web/utils/proptypes';

import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';

const DEFAULTS = {name: '127.0.0.1', comment: ''};

const HostsDialog = ({host, title = _('New Host'), onClose, onSave}) => {
  return (
    <SaveDialog
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={{...DEFAULTS, ...host}}
    >
      {({values: state, onValueChange}) => {
        return (
          <Layout flex="column">
            <FormGroup title={_('IP Address')}>
              <TextField
                name="name"
                grow="1"
                value={state.name}
                size="30"
                disabled={isDefined(host)}
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
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

HostsDialog.propTypes = {
  comment: PropTypes.string,
  host: PropTypes.model,
  name: PropTypes.string,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default HostsDialog;

// vim: set ts=2 sw=2 tw=80:
