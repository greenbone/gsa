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

import  _ from '../../locale.js';

import Layout from '../components/layout/layout.js';

import PropTypes from '../proptypes.js';

import {withDialog} from '../components/dialog/dialog.js';

import FormGroup from '../components/form/formgroup.js';
import TextField from '../components/form/textfield.js';
import Select2 from '../components/form/select2.js';

const FilterDialog = ({
    comment,
    name,
    term,
    type,
    types,
    onValueChange,
  }) => {
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
          grow="1"
          value={comment}
          size="30"
          maxLength="400"
          onChange={onValueChange}/>
      </FormGroup>

      <FormGroup title={_('Term')}>
        <TextField
          name="term"
          grow="1"
          value={term}
          size="30"
          onChange={onValueChange}/>
      </FormGroup>

      <FormGroup title={_('Type')}>
        <Select2
          name="type"
          onChange={onValueChange}
          value={type}>
          {
            types.map(option => (
              <option key={option[1]} value={option[1]}>{option[2]}</option>
            ))
          }
        </Select2>
      </FormGroup>
    </Layout>
  );
};

FilterDialog.propTypes = {
  comment: PropTypes.string,
  name: PropTypes.string,
  term: PropTypes.string,
  type: PropTypes.string,
  types: PropTypes.array.isRequired,
  onValueChange: PropTypes.func,
};

export default withDialog(FilterDialog, {
  title: _('New Filter'),
  footer: _('Save'),
  defaultState: {
    comment: '',
    name: _('Unnamed'),
  },
});

// vim: set ts=2 sw=2 tw=80:
