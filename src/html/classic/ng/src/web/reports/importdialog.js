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
import {render_options} from '../render.js';

import {withDialog} from '../dialog/dialog.js';

import FileField from '../form/filefield.js';
import FormGroup from '../form/formgroup.js';
import Select2 from '../form/select2.js';
import Text from '../form/text.js';
import YesNoRadio from '../form/yesnoradio.js';

import NewIcon from '../icons/newicon.js';

const ImportDialog = ({
    in_assets = 1,
    newContainerTask = true,
    task_id,
    tasks,
    onNewContainerTaskClick,
    onValueChange,
  }) => {

  return (
    <Layout flex="column">
      <FormGroup title={_('Report')}>
        <FileField
          name="xml_file"
          onChange={onValueChange}/>
      </FormGroup>
      <FormGroup title={_('Container Task')} flex>
        <Select2 name="task_id"
          value={task_id}
          onChange={onValueChange}>
          {render_options(tasks)}
        </Select2>
        {newContainerTask &&
          <Layout flex box>
            <NewIcon
              title={_('Create new Container Task')}
              onClick={onNewContainerTaskClick}/>
          </Layout>
        }
      </FormGroup>
      <FormGroup title={_('Add to Assets')}>
        <Layout flex="column">
          <Text>
            {_('Add to Assets with QoD >= 70% and Overrides enabled')}
          </Text>
          <YesNoRadio
            value={in_assets}
            name="in_assets"
            onChange={onValueChange}/>
        </Layout>
      </FormGroup>
    </Layout>
  );
};

ImportDialog.propTypes = {
  in_assets: PropTypes.yesno,
  newContainerTask: PropTypes.bool,
  task_id: PropTypes.id,
  tasks: PropTypes.array,
  onValueChange: PropTypes.func,
  onNewContainerTaskClick: PropTypes.func,
};


export default withDialog(ImportDialog, {
  title: _('Import Report'),
  footer: _('Import'),
});

// vim: set ts=2 sw=2 tw=80:
