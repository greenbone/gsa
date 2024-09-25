/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import SaveDialog from 'web/components/dialog/savedialog';

import PropTypes from 'web/utils/proptypes';

import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';

import useTranslation from 'web/hooks/useTranslation';

const DEFAULTS = {name: '127.0.0.1', comment: ''};

const HostsDialog = ({host, title, onClose, onSave}) => {
  const [_] = useTranslation();
  title = title || _('New Host');
  return (
    <SaveDialog
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={{...DEFAULTS, ...host}}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            <FormGroup title={_('IP Address')}>
              <TextField
                name="name"
                value={state.name}
                disabled={isDefined(host)}
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
          </>
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
