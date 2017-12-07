/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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

import _ from 'gmp/locale.js';
import {YES_VALUE} from 'gmp/parser.js';

import PropTypes from '../../utils/proptypes.js';
import {render_options} from '../../utils/render.js';

import withDialog from '../../components/dialog/withDialog.js';

import FileField from '../../components/form/filefield.js';
import FormGroup from '../../components/form/formgroup.js';
import Select2 from '../../components/form/select2.js';
import Text from '../../components/form/text.js';
import YesNoRadio from '../../components/form/yesnoradio.js';

import NewIcon from '../../components/icon/newicon.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

const ImportDialog = ({
  in_assets = YES_VALUE,
  newContainerTask = true,
  task_id,
  tasks,
  onNewContainerTaskClick,
  onValueChange,
}) => (
  <Layout flex="column">
    <FormGroup title={_('Report')}>
      <FileField
        name="xml_file"
        onChange={onValueChange}/>
    </FormGroup>
    <FormGroup title={_('Container Task')} flex>
      <Divider>
        <Select2
          name="task_id"
          value={task_id}
          onChange={onValueChange}>
          {render_options(tasks)}
        </Select2>
        {newContainerTask &&
          <NewIcon
            title={_('Create new Container Task')}
            onClick={onNewContainerTaskClick}/>
        }
      </Divider>
    </FormGroup>
    <FormGroup title={_('Add to Assets')}>
      <Divider flex="column">
        <Text>
          {_('Add to Assets with QoD >= 70% and Overrides enabled')}
        </Text>
        <YesNoRadio
          value={in_assets}
          name="in_assets"
          onChange={onValueChange}/>
      </Divider>
    </FormGroup>
  </Layout>
);

ImportDialog.propTypes = {
  in_assets: PropTypes.yesno,
  newContainerTask: PropTypes.bool,
  task_id: PropTypes.id,
  tasks: PropTypes.array,
  onNewContainerTaskClick: PropTypes.func,
  onValueChange: PropTypes.func,
};


export default withDialog({
  title: _('Import Report'),
  footer: _('Import'),
})(ImportDialog);

// vim: set ts=2 sw=2 tw=80:
