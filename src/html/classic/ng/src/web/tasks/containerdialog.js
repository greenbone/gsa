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

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';

import {withDialog} from '../dialog/dialog.js';

import FormGroup from '../form/formgroup.js';
import TextField from '../form/textfield.js';

import AddResultsToAssetsGroup from './addresultstoassetsgroup.js';
import AutoDeleteReportsGroup from './autodeletereportsgroup.js';

const ContainerTaskDialog = ({
    auto_delete,
    auto_delete_data = 5,
    comment,
    in_assets,
    name,
    task,
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
      {task &&
        <AddResultsToAssetsGroup
          inAssets={in_assets}
          onChange={onValueChange}/>
      }
      {task &&
        <AutoDeleteReportsGroup
          autoDelete={auto_delete}
          autoDeleteData={auto_delete_data}
          onChange={onValueChange}/>
      }
    </Layout>
  );
};

ContainerTaskDialog.propTypes = {
  task: PropTypes.model,
  name: PropTypes.string,
  comment: PropTypes.string,
  in_assets: PropTypes.yesno,
  auto_delete: PropTypes.oneOf([
    'keep', 'no',
  ]),
  auto_delete_data: PropTypes.number,
  onValueChange: PropTypes.func,
};


export default withDialog(ContainerTaskDialog, {
  title: _('Create Container Task'),
  footer: _('Save'),
});

// vim: set ts=2 sw=2 tw=80:
