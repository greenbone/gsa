/* Copyright (C) 2017-2020 Greenbone Networks GmbH
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
            <FormGroup title={_('Name')}>
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
