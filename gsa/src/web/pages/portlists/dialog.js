/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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

import {NO_VALUE, YES_VALUE, parseYesNo} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import SaveDialog from 'web/components/dialog/savedialog';

import FileField from 'web/components/form/filefield';
import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import TextField from 'web/components/form/textfield';

import NewIcon from 'web/components/icon/newicon';

import Section from 'web/components/section/section';

import PropTypes from 'web/utils/proptypes';

import PortRangesTable from './portrangestable';

const FROM_FILE = YES_VALUE;
const NOT_FROM_FILE = NO_VALUE;

const PortListsDialog = ({
  comment = '',
  fromFile = NO_VALUE,
  id,
  name = _('Unnamed'),
  portList,
  portRange = 'T:1-5,7,9,U:1-3,5,7,9',
  portRanges = [],
  title = _('New Port List'),
  onClose,
  onNewPortRangeClick,
  onTmpDeletePortRange,
  onSave,
}) => {
  const isEdit = isDefined(portList);

  const newrangeicon = (
    <div>
      <NewIcon
        value={portList}
        title={_('Add Port Range')}
        onClick={onNewPortRangeClick}
      />
    </div>
  );

  const data = {
    id,
    comment,
    fromFile,
    name,
    portRange,
  };

  return (
    <SaveDialog
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={data}
      values={{portRanges}}
    >
      {({values: state, onValueChange}) => {
        return (
          <Layout flex="column">
            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                value={state.name}
                grow="1"
                size="30"
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                value={state.comment}
                grow="1"
                size="30"
                onChange={onValueChange}
              />
            </FormGroup>

            {!isEdit && (
              <FormGroup title={_('Port Ranges')} flex="column">
                <Divider flex="column">
                  <Divider>
                    <Radio
                      title={_('Manual')}
                      name="fromFile"
                      value={NOT_FROM_FILE}
                      onChange={onValueChange}
                      checked={parseYesNo(state.fromFile) !== FROM_FILE}
                    />
                    <TextField
                      grow="1"
                      name="portRange"
                      value={state.portRange}
                      disabled={parseYesNo(state.fromFile) === FROM_FILE}
                      onChange={onValueChange}
                      size="30"
                    />
                  </Divider>
                  <Divider>
                    <Radio
                      title={_('From file')}
                      name="fromFile"
                      value={FROM_FILE}
                      onChange={onValueChange}
                      checked={parseYesNo(state.fromFile) === FROM_FILE}
                    />
                    <FileField
                      name="file"
                      disabled={parseYesNo(state.fromFile) !== FROM_FILE}
                      onChange={onValueChange}
                    />
                  </Divider>
                </Divider>
              </FormGroup>
            )}
            {isEdit && (
              <Section title={_('Port Ranges')} extra={newrangeicon}>
                {isDefined(portList) && (
                  <PortRangesTable
                    portRanges={state.portRanges}
                    onDeleteClick={onTmpDeletePortRange}
                  />
                )}
              </Section>
            )}
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

PortListsDialog.propTypes = {
  comment: PropTypes.string,
  fromFile: PropTypes.yesno,
  id: PropTypes.string,
  name: PropTypes.string,
  portList: PropTypes.model,
  portRange: PropTypes.string,
  portRanges: PropTypes.array,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onDeletePortRangeClick: PropTypes.func,
  onNewPortRangeClick: PropTypes.func,
  onSave: PropTypes.func.isRequired,
  onTmpDeletePortRange: PropTypes.func.isRequired,
};

export default PortListsDialog;

// vim: set ts=2 sw=2 tw=80:
