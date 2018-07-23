/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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

import _ from 'gmp/locale';

import Divider from '../../components/layout/divider.js';

import PropTypes from '../../utils/proptypes.js';
import withPrefix from '../../utils/withPrefix.js';

import Select from '../../components/form/select.js';
import Radio from '../../components/form/radio.js';

const VALUE = 'Task run status changed';

const TaskEventPart = ({
    prefix,
    event,
    status,
    onChange,
    onEventChange,
  }) => {
  return (
    <Divider>
      <Radio
        title={_('Task run status changed to')}
        name="event"
        value={VALUE}
        checked={event === VALUE}
        onChange={onEventChange}
      >
      </Radio>
      <Select
        onChange={onChange}
        name={prefix + 'status'}
        value={status}
      >
        <option value="Done">{('Done')}</option>
        <option value="New">{_('New')}</option>
        <option value="Requested">{_('Requested')}</option>
        <option value="Running">{_('Running')}</option>
        <option value="Stop Requested">{_('Stop Requested')}</option>
        <option value="Stopped">{_('Stopped')}</option>
      </Select>
    </Divider>
  );
};

TaskEventPart.propTypes = {
  event: PropTypes.string.isRequired,
  prefix: PropTypes.string,
  status: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  onEventChange: PropTypes.func,
};

export default withPrefix(TaskEventPart);

// vim: set ts=2 sw=2 tw=80:
