/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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
import {parse_int} from 'gmp/parser.js';

import PropTypes from '../../utils/proptypes.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import FormGroup from '../../components/form/formgroup.js';
import Radio from '../../components/form/radio.js';
import TextField from '../../components/form/textfield.js';

import Layout from '../../components/layout/layout.js';

const PortRangeDialog = ({
  port_list,
  port_type = 'tcp',
  title = _('New Port Range'),
  visible,
  onClose,
  onSave,
}) => {

  const data = {
    ...port_list,
    port_type,
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
            <FormGroup title={_('Start')}>
              <TextField
                name="port_range_start"
                value={state.port_range_start}
                grow="1"
                size="30"
                convert={parse_int}
                onChange={onValueChange}
                maxLength="80"
              />
            </FormGroup>

            <FormGroup title={_('End')}>
              <TextField
                name="port_range_end"
                value={state.port_range_end}
                grow="1"
                size="30"
                maxLength="80"
                convert={parse_int}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Protocol')} flex>
              <Radio
                title={_('TCP')}
                name="port_type"
                value="tcp"
                onChange={onValueChange}
                checked={state.port_type === 'tcp'}
              />
              <Radio
                title={_('UDP')}
                name="port_type"
                value="udp"
                onChange={onValueChange}
                checked={state.port_type === 'udp'}
              />
            </FormGroup>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

PortRangeDialog.propTypes = {
  port_list: PropTypes.model,
  port_type: PropTypes.string,
  title: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default PortRangeDialog;

// vim: set ts=2 sw=2 tw=80:
