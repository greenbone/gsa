/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import TextField from 'web/components/form/TextField';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const DEFAULTS = {name: '127.0.0.1', comment: ''};

const HostsDialog = ({host, title, onClose, onSave}) => {
  const [_] = useTranslation();
  title = title || _('New Host');
  return (
    <SaveDialog
      defaultValues={{...DEFAULTS, ...host}}
      title={title}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            <FormGroup title={_('IP Address')}>
              <TextField
                disabled={isDefined(host)}
                name="name"
                value={state.name}
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
