/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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

import PropTypes from '../../utils/proptypes.js';

import withDialog from '../../components/dialog/withDialog.js';

import FormGroup from '../../components/form/formgroup.js';
import TextField from '../../components/form/textfield.js';
import Select from '../../components/form/select.js';
import YesNoRadio from '../../components/form/yesnoradio.js';

import Layout from '../../components/layout/layout.js';

const TagDialog = ({
  active,
  comment,
  fixed,
  name,
  resource_id,
  resource_type,
  resource_types,
  value,
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
          value={comment}
          grow="1"
          size="30"
          maxLength="400"
          onChange={onValueChange}/>
      </FormGroup>

      <FormGroup title={_('Value')}>
        <TextField
          name="value"
          value={value}
          grow="1"
          onChange={onValueChange}/>
      </FormGroup>

      <FormGroup title={_('Resource Type')}>
        <Select
          name="resource_type"
          value={resource_type}
          disabled={fixed}
          onChange={onValueChange}>
          {resource_types.map(type => (
            <option
              key={type[0]}
              value={type[0]}
            >
              {type[1]}
            </option>
          ))}
        </Select>
      </FormGroup>

      <FormGroup title={_('Resource ID')}>
        <TextField
          name="resource_id"
          value={resource_id}
          grow="1"
          disabled={fixed}
          onChange={onValueChange}/>
      </FormGroup>

      <FormGroup title={_('Active')}>
        <YesNoRadio
          name="active"
          value={active}
          onChange={onValueChange}
        />
      </FormGroup>

    </Layout>
  );
};

TagDialog.propTypes = {
  active: PropTypes.yesno,
  comment: PropTypes.string,
  fixed: PropTypes.bool,
  name: PropTypes.string,
  resource_id: PropTypes.id,
  resource_type: PropTypes.string,
  resource_types: PropTypes.array.isRequired,
  tag: PropTypes.model,
  value: PropTypes.string,
  onValueChange: PropTypes.func,
};

export default withDialog({
  title: _('New Tag'),
  footer: _('Save'),
  defaultState: {
    active: 1,
    comment: '',
    fixed: false,
    name: _('default:unnamed'),
    value: '',
    resource_type: 'agent',
    resource_id: '',
  },
})(TagDialog);

// vim: set ts=2 sw=2 tw=80:
