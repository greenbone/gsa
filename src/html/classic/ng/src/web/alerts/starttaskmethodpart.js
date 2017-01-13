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

import _ from '../../locale.js';
import {select_save_id} from '../../utils.js';

import {render_options} from '../render.js';

import Select2 from '../form/select2.js';
import FormGroup from '../form/formgroup.js';
import FormPart from '../form/formpart.js';

export class StartTaskMethodPart extends FormPart {

  constructor(props) {
    super(props, 'method_data');
  }

  defaultState() {
    let {tasks = [], data = {}} = this.props;
    return {
      start_task_task: select_save_id(tasks, data.start_task_task),
    };
  }

  componentWillMount() {
    this.notify();
  }

  render() {
    let {tasks = [], start_task_task} = this.props;
    let task_opts = render_options(tasks);
    return (
      <FormGroup title={_('Start Task')}>
        <Select2
          name="start_task_task"
          value={start_task_task}
          onChange={this.onValueChange}>
          {task_opts}
        </Select2>
      </FormGroup>
    );
  }
}

export default StartTaskMethodPart;

// vim: set ts=2 sw=2 tw=80:
