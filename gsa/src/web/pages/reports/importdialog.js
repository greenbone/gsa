/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import _ from 'gmp/locale';

import {YES_VALUE} from 'gmp/parser';

import SaveDialog from 'web/components/dialog/savedialog';

import FileField from 'web/components/form/filefield';
import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';
import YesNoRadio from 'web/components/form/yesnoradio';

import NewIcon from 'web/components/icon/newicon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

const ImportDialog = ({
  in_assets = YES_VALUE,
  newContainerTask = true,
  task_id,
  tasks,
  onClose,
  onNewContainerTaskClick,
  onSave,
  onTaskChange,
}) => {
  return (
    <SaveDialog
      buttonTitle={_('Import')}
      title={_('Import Report')}
      onClose={onClose}
      onSave={onSave}
      values={{task_id}}
      defaultValues={{in_assets}}
    >
      {({values, onValueChange}) => (
        <Layout flex="column">
          <FormGroup title={_('Report')}>
            <FileField name="xml_file" onChange={onValueChange} />
          </FormGroup>
          <FormGroup title={_('Container Task')}>
            <Divider>
              <Select
                name="task_id"
                value={values.task_id}
                items={renderSelectItems(tasks)}
                onChange={onTaskChange}
              />
              {newContainerTask && (
                <NewIcon
                  title={_('Create new Container Task')}
                  onClick={onNewContainerTaskClick}
                />
              )}
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
  onClose: PropTypes.func.isRequired,
  onNewContainerTaskClick: PropTypes.func,
  onSave: PropTypes.func.isRequired,
  onTaskChange: PropTypes.func,
};

export default ImportDialog;

// vim: set ts=2 sw=2 tw=80:
