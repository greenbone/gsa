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

import {parseInt} from 'gmp/parser';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import TextField from 'web/components/form/textfield';

import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';

const convertPort = value => (value === '' ? value : parseInt(value));

const PortRangeDialog = ({
  id,
  portType = 'tcp',
  title = _('New Port Range'),
  onClose,
  onSave,
}) => {
  const data = {
    id,
    portRangeStart: '',
    portRangeEnd: '',
    portType,
  };

  return (
    <SaveDialog
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={data}
    >
      {({values: state, onValueChange}) => {
        return (
          <Layout flex="column">
            <FormGroup title={_('Start')}>
              <TextField
                name="portRangeStart"
                value={state.portRangeStart}
                grow="1"
                size="30"
                convert={convertPort}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('End')}>
              <TextField
                name="portRangeEnd"
                value={state.portRangeEnd}
                grow="1"
                size="30"
                convert={convertPort}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Protocol')}>
              <Radio
                title={_('TCP')}
                name="portType"
                value="tcp"
                onChange={onValueChange}
                checked={state.portType === 'tcp'}
              />
              <Radio
                title={_('UDP')}
                name="portType"
                value="udp"
                onChange={onValueChange}
                checked={state.portType === 'udp'}
              />
            </FormGroup>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

PortRangeDialog.propTypes = {
  id: PropTypes.id.isRequired,
  portList: PropTypes.model,
  portType: PropTypes.string,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default PortRangeDialog;

// vim: set ts=2 sw=2 tw=80:
