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
import {is_defined, map} from 'gmp/utils';

import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import Checkbox from '../../components/form/checkbox.js';
import FormGroup from '../../components/form/formgroup.js';
import MultiSelect from '../../components/form/multiselect.js';
import TextField from '../../components/form/textfield.js';

const DEFAULTS = {name: _('Unnamed'), users: []};

const Dialog = ({
    allUsers,
    grant_full,
    group,
    title = _('New Group'),
    visible,
    onClose,
    onSave,
  }) => {
  const is_edit = is_defined(group);

  const userOptions = map(allUsers, user => ({
    value: user.name,
    label: user.name,
  }));

  return (
    <SaveDialog
      visible={visible}
      title={title}
      onClose={onClose}
      onSave={onSave}
      initialData={{
        ...DEFAULTS,
        ...group,
      }}
    >
      {({
        data: state,
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

            <FormGroup
              title={_('Comment')}
              flex="column">
              <TextField
                name="comment"
                value={state.comment}
                size="30"
                maxLength="400"
                onChange={onValueChange}/>
            </FormGroup>

            <FormGroup
              title={_('Users')}>
              <MultiSelect
                name="users"
                items={userOptions}
                value={state.users}
                onChange={onValueChange}
              />
            </FormGroup>

            {!is_edit &&
              <FormGroup
                title={_('Special Groups')}>
                <Checkbox
                  name="grant_full"
                  checkedValue="1"
                  unCheckedValue="0"
                  checked={state.grant_full === '1'}
                  title={_('Create permission to grant full read and write ' +
                    'access among all group members and across any resources')}
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

Dialog.propTypes = {
  allUsers: PropTypes.array,
  grant_full: PropTypes.oneOf(['0', '1']),
  group: PropTypes.model,
  title: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default Dialog;

// vim: set ts=2 sw=2 tw=80:
