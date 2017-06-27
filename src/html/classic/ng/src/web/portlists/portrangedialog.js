/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import PropTypes from '../proptypes.js';

import {withDialog} from '../components/dialog/dialog.js';

import FormGroup from '../components/form/formgroup.js';
import Radio from '../components/form/radio.js';
import TextField from '../components/form/textfield.js';

import Layout from '../components/layout/layout.js';

const PortRangeDialog = ({
    port_range_end,
    port_range_start,
    port_type,
    onValueChange,
  }) => {
  return (
    <Layout flex="column">
      <FormGroup title={_('Start')}>
        <TextField
          name="port_range_start"
          value={port_range_start}
          grow="1"
          size="30"
          onChange={onValueChange}
          maxLength="80"/>
      </FormGroup>

      <FormGroup title={_('End')}>
        <TextField
          name="port_range_end"
          value={port_range_end}
          grow="1"
          size="30"
          maxLength="80"
          onChange={onValueChange}/>
      </FormGroup>

      <FormGroup title={_('Protocol')} flex>
        <Radio
          title={_('TCP')}
          name="port_type"
          value="tcp"
          onChange={onValueChange}
          checked={port_type === 'tcp'}/>
        <Radio
          title={_('UDP')}
          name="port_type"
          value="udp"
          onChange={onValueChange}
          checked={port_type === 'udp'}/>
      </FormGroup>
    </Layout>
  );
};

PortRangeDialog.propTypes = {
  port_range_end: PropTypes.number,
  port_range_start: PropTypes.number,
  port_type: PropTypes.oneOf([
    'tcp', 'udp',
  ]),
  onValueChange: PropTypes.func,
};


export default withDialog(PortRangeDialog, {
  title: _('New Port Range'),
  footer: _('Save'),
  defaultState: {
    port_type: 'tcp',
  }
});

// vim: set ts=2 sw=2 tw=80:
