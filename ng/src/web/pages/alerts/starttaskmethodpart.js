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

import _ from 'gmp/locale.js';

import PropTypes from '../../utils/proptypes.js';
import {render_options} from '../../utils/render.js';
import withPrefix from '../../utils/withPrefix.js';

import Select from '../../components/form/select.js';
import FormGroup from '../../components/form/formgroup.js';

const StartTaskMethodPart = ({
    prefix,
    tasks,
    startTaskTask,
    onChange,
  }) => {
  return (
    <FormGroup title={_('Start Task')}>
      <Select
        name={prefix + 'start_task_task'}
        value={startTaskTask}
        onChange={onChange}>
        {render_options(tasks)}
      </Select>
    </FormGroup>
  );
};

StartTaskMethodPart.propTypes = {
  prefix: PropTypes.string,
  startTaskTask: PropTypes.id,
  tasks: PropTypes.array,
  onChange: PropTypes.func,
};


export default withPrefix(StartTaskMethodPart);

// vim: set ts=2 sw=2 tw=80:
