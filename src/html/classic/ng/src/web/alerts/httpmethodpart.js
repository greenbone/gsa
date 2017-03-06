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

import {withPrefix} from '../render.js';

import FormGroup from '../form/formgroup.js';
import TextField from '../form/textfield.js';

const HttpMethodPart = ({
    prefix,
    URL,
    onChange,
  }) => {
  return (
    <FormGroup title={_('HTTP Get URL')}>
      <TextField
        grow="1"
        name={prefix + 'URL'}
        maxLength="301"
        value={URL}
        onChange={onChange}/>
    </FormGroup>
  );
};

HttpMethodPart.propTypes = {
  prefix: React.PropTypes.string,
  URL: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func,
};

export default withPrefix(HttpMethodPart);

// vim: set ts=2 sw=2 tw=80:
