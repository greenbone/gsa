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

import {isDefined} from 'gmp/utils/identity';

import withLayout from 'web/components/layout/withLayout';

import PropTypes from 'web/utils/proptypes';

const FileFieldComponent = props => {
  const handleChange = event => {
    const {onChange, disabled, name} = props;

    event.preventDefault();

    if (!disabled && isDefined(onChange)) {
      onChange(event.target.files[0], name);
    }
  };

  const {onChange, ...args} = props;
  return <input {...args} type="file" onChange={handleChange} />;
};

FileFieldComponent.propTypes = {
  disabled: PropTypes.bool,
  name: PropTypes.string,
  onChange: PropTypes.func,
};

export default withLayout()(FileFieldComponent);

// vim: set ts=2 sw=2 tw=80:
