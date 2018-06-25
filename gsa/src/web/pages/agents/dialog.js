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
import {is_defined} from 'gmp/utils';

import Layout from '../../components/layout/layout.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import FileField from '../../components/form/filefield.js';
import FormGroup from '../../components/form/formgroup.js';
import TextField from '../../components/form/textfield.js';

import PropTypes from '../../utils/proptypes.js';

const DEFAULTS = {name: _('Unnamed')};

const AgentDialog = ({
    agent,
    title = _('New Agent'),
    visible = true,
    onClose,
    onSave,
  }) => {

  const is_edit = is_defined(agent);

  return (
    <SaveDialog
      visible={visible}
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={{...DEFAULTS, ...agent}}
    >
      {({
        values: state,
        onValueChange,
      }) => {

        return (
          <Layout flex="column">

            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                grow="1"
                value={state.name}
                size="30"
                onChange={onValueChange}
                maxLength="80"
              />
            </FormGroup>

            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                value={state.comment}
                grow="1"
                size="30"
                maxLength="400"
                onChange={onValueChange}
              />
            </FormGroup>

            {!is_edit &&
              <FormGroup title={_('Installer')}>
                <FileField
                  name="installer"
                  onChange={onValueChange}
                />
              </FormGroup>
            }

            {!is_edit &&
              <FormGroup title={_('Installer signature')}>
                <FileField
                  name="installer_sig"
                  onChange={onValueChange}
                />
              </FormGroup>
            }
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

AgentDialog.propTypes = {
  agent: PropTypes.model,
  title: PropTypes.string,
  visible: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};


export default AgentDialog;

// vim: set ts=2 sw=2 tw=80:
