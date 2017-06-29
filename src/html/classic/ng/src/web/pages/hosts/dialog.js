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

import  _ from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';

import {withDialog} from '../../components/dialog/dialog.js';

import FormGroup from '../../components/form/formgroup.js';
import TextField from '../../components/form/textfield.js';

const HostsDialog = ({
    host,
    name,
    comment,
    onValueChange
  }) => {
  return (
    <Layout flex="column">
      <FormGroup title={_('Name')}>
        <TextField
          name="name"
          grow="1"
          value={name}
          size="30"
          disabled={is_defined(host)}
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
    </Layout>
  );
};

HostsDialog.propTypes = {
  host: PropTypes.model,
  name: PropTypes.string,
  comment: PropTypes.string,
  onValueChange: PropTypes.func,
};


export default withDialog(HostsDialog, {
  title: _('New Host'),
  footer: _('Save'),
  defaultState: {
    name: '127.0.0.1',
    comment: '',
  },
});
