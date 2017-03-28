/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import _ from '../../locale.js';
import {is_defined} from '../../utils.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';

import {withDialog} from '../dialog/dialog.js';

import FileField from '../form/filefield.js';
import FormGroup from '../form/formgroup.js';
import TextField from '../form/textfield.js';

const AgentDialog = ({
    agent,
    comment,
    name,
    onValueChange
  }) => {

  const is_edit = is_defined(agent);

  return (
    <Layout flex="column">

      <FormGroup title={_('Name')}>
        <TextField
          name="name"
          grow="1"
          value={name}
          size="30"
          onChange={onValueChange}
          maxLength="80"/>
      </FormGroup>

      <FormGroup title={_('Comment')}>
        <TextField
          name="comment"
          value={comment}
          grow="1"
          size="30"
          maxLength="400"
          onChange={onValueChange}/>
      </FormGroup>

      {!is_edit &&
        <FormGroup title={_('Installer')}>
          <FileField
            name="installer"
            onChange={onValueChange}/>
        </FormGroup>
      }

      {!is_edit &&
        <FormGroup title={_('Installer signature')}>
          <FileField
            name="installer_sig"
            onChange={onValueChange}/>
        </FormGroup>
      }

    </Layout>
  );
};

AgentDialog.propTypes = {
  agent: PropTypes.model,
  name: React.PropTypes.string,
  comment: React.PropTypes.string,
  onValueChange: React.PropTypes.func,
};


export default withDialog(AgentDialog, {
  title: _('New Alert'),
  footer: _('Save'),
  defaultState: {
    comment: '',
    name: _('Unnamed'),
  },
});

// vim: set ts=2 sw=2 tw=80:
