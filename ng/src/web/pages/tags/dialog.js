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
import {YES_VALUE} from 'gmp/parser';
import {is_defined, map} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import FormGroup from '../../components/form/formgroup.js';
import TextField from '../../components/form/textfield.js';
import Select from '../../components/form/select.js';
import YesNoRadio from '../../components/form/yesnoradio.js';

import Layout from '../../components/layout/layout.js';

const DEFAULTS = {
  active: YES_VALUE,
  comment: '',
  fixed: false,
  name: _('default:unnamed'),
  value: '',
};

const TagDialog = ({
  resource_id = '',
  resource_type = 'agent',
  resource_types = [],
  tag,
  title = _('New Tag'),
  visible,
  onClose,
  onSave,
  ...options
  }) => {

  const resourceTypesOptions = map(resource_types, rtype => ({
    label: rtype[1],
    value: rtype[0],
  }));

  const data = {
    ...DEFAULTS,
    ...options,
    ...tag,
  };
  if (is_defined(resource_id)) {
    data.resource_id = resource_id;
  };
  if (is_defined(resource_type)) {
    data.resource_type = resource_type;
  };

  return (
    <SaveDialog
      visible={visible}
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={data}
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
                maxLength="80"/>
            </FormGroup>

            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                value={state.comment}
                grow="1"
                size="30"
                maxLength="400"
                onChange={onValueChange}/>
            </FormGroup>

            <FormGroup title={_('Value')}>
              <TextField
                name="value"
                value={state.value}
                grow="1"
                onChange={onValueChange}/>
            </FormGroup>

            <FormGroup title={_('Resource Type')}>
              <Select
                name="resource_type"
                items={resourceTypesOptions}
                value={state.resource_type}
                disabled={state.fixed}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Resource ID')}>
              <TextField
                name="resource_id"
                value={state.resource_id}
                grow="1"
                disabled={state.fixed}
                onChange={onValueChange}/>
            </FormGroup>

            <FormGroup title={_('Active')}>
              <YesNoRadio
                name="active"
                value={state.active}
                onChange={onValueChange}
              />
            </FormGroup>

          </Layout>
        );
      }}
    </SaveDialog>
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
  title: PropTypes.string,
  value: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onValueChange: PropTypes.func,
};

export default TagDialog;

// vim: set ts=2 sw=2 tw=80:
