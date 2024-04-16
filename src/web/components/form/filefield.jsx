/* Copyright (C) 2016-2022 Greenbone AG
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

import React, {useCallback} from 'react';

import {FileInput} from '@greenbone/opensight-ui-components';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

const FileField = ({disabled, grow, name, title, onChange, ...props}) => {
  const handleChange = useCallback(
    file => {
      if (!disabled && isDefined(onChange)) {
        onChange(file, name);
      }
    },
    [onChange, disabled, name],
  );

  return (
    <FileInput
      {...props}
      styles={{root: {flexGrow: grow}}}
      label={title}
      name={name}
      disabled={disabled}
      onChange={handleChange}
    />
  );
};

FileField.propTypes = {
  disabled: PropTypes.bool,
  grow: PropTypes.numberOrNumberString,
  name: PropTypes.string,
  title: PropTypes.string,
  onChange: PropTypes.func,
};

export default FileField;

// vim: set ts=2 sw=2 tw=80:
