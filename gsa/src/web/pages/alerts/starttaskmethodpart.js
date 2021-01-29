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

import Select from 'web/components/form/select';
import FormGroup from 'web/components/form/formgroup';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';
import withPrefix from 'web/utils/withPrefix';

const StartTaskMethodPart = ({prefix, tasks, startTaskTask, onChange}) => (
  <FormGroup title={_('Start Task')}>
    <Select
      name={prefix + 'start_task_task'}
      value={startTaskTask}
      items={renderSelectItems(tasks)}
      onChange={onChange}
    />
  </FormGroup>
);

StartTaskMethodPart.propTypes = {
  prefix: PropTypes.string,
  startTaskTask: PropTypes.id,
  tasks: PropTypes.array,
  onChange: PropTypes.func,
};

export default withPrefix(StartTaskMethodPart);

// vim: set ts=2 sw=2 tw=80:
