/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import  _ from '../../locale.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';

import {withDialog} from '../dialog/dialog.js';

import FileField from '../form/filefield.js';
import FormGroup from '../form/formgroup.js';
import Radio from '../form/radio.js';
import TextField from '../form/textfield.js';

const PortListsDialog = ({name, comment, from_file, port_range,
    onValueChange}) => {
  return (
    <Layout flex="column">

      <FormGroup title={_('Name')}>
        <TextField
          name="name"
          value={name}
          grow="1"
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

      <FormGroup title={_('Port Ranges')} flex="column">
        <Layout flex box>
          <Radio
            title={_('Manual')}
            name="from_file"
            value="0"
            onChange={onValueChange}
            checked={from_file !== '1'}/>
          <TextField
            grow="1"
            name="port_range"
            value={port_range}
            disabled={from_file === '1'}
            onChange={onValueChange}
            size="30" maxLength="400"/>
        </Layout>

        <Layout flex box>
          <Radio title={_('From file')}
            name="from_file"
            value="1"
            onChange={onValueChange}
            checked={from_file === '1'}/>
          <FileField
            name="file"
            onChange={onValueChange}/>
        </Layout>
      </FormGroup>
    </Layout>
  );
};

PortListsDialog.propTypes = {
  name: React.PropTypes.string,
  comment: React.PropTypes.string,
  from_file: PropTypes.yesno,
  port_range: React.PropTypes.string,
  onValueChange: React.PropTypes.func,
};


export default withDialog(PortListsDialog, {
  title: _('New Port List'),
  footer: _('Save'),
  defaultState: {
    name: _('Unnamed'),
    comment: '',
    from_file: 0,
    port_range: 'T:1-5,7,9,U:1-3,5,7,9',
  },
});

// vim: set ts=2 sw=2 tw=80:
