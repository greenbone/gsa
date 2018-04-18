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
import {YES_VALUE} from 'gmp/parser.js';

import PropTypes from '../../utils/proptypes.js';
import {render_select_items} from '../../utils/render.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import FileField from '../../components/form/filefield.js';
import FormGroup from '../../components/form/formgroup.js';
import Select from '../../components/form/select.js';
import YesNoRadio from '../../components/form/yesnoradio.js';

import NewIcon from '../../components/icon/newicon.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

const ImportDialog = ({
  in_assets = YES_VALUE,
  newContainerTask = true,
  task_id,
  tasks,
  visible = true,
  onClose,
  onNewContainerTaskClick,
  onSave,
  onTaskChange,
}) => {
  return (
    <SaveDialog
      buttonTitle={_('Import')}
      visible={visible}
      title={_('Import Report')}
      onClose={onClose}
      onSave={onSave}
      values={{task_id}}
      defaultValues={{in_assets}}
    >
      {({
        values,
        onValueChange,
      }) => (
        <Layout flex="column">
          <FormGroup title={_('Report')}>
            <FileField
              name="xml_file"
              onChange={onValueChange}
            />
          </FormGroup>
          <FormGroup title={_('Container Task')} flex>
            <Divider>
              <Select
                name="task_id"
                value={values.task_id}
                items={render_select_items(tasks)}
                onChange={onTaskChange}
              />
              {newContainerTask &&
                <NewIcon
                  title={_('Create new Container Task')}
                  onClick={onNewContainerTaskClick}
                />
              }
            </Divider>
          </FormGroup>
          <FormGroup title={_('Add to Assets')}>
            <Divider flex="column">
              <span>
                {_('Add to Assets with QoD >= 70% and Overrides enabled')}
              </span>
              <YesNoRadio
                value={values.in_assets}
                name="in_assets"
                onChange={onValueChange}
              />
            </Divider>
          </FormGroup>
        </Layout>
      )}
    </SaveDialog>
  );
};

ImportDialog.propTypes = {
  in_assets: PropTypes.yesno,
  newContainerTask: PropTypes.bool,
  task_id: PropTypes.id,
  tasks: PropTypes.array,
  title: PropTypes.string,
  visible: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onNewContainerTaskClick: PropTypes.func,
  onSave: PropTypes.func.isRequired,
  onTaskChange: PropTypes.func,
};


export default ImportDialog;

// vim: set ts=2 sw=2 tw=80:
