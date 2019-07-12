/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import {isDefined} from 'gmp/utils/identity';

import PropTypes from '../../utils/proptypes.js';

import FormGroup from '../form/formgroup.js';
import Spinner from '../form/spinner.js';
import {parseSeverity} from 'gmp/parser.js';

const CvssBaseGroup = ({cvss, filter, onChange, name = 'cvss_base'}) => {
  if (!isDefined(cvss) && isDefined(filter)) {
    cvss = parseSeverity(filter.get('cvss_base'));
  }

  return (
    <FormGroup title={_('Severity')}>
      <Spinner
        type="int"
        name={name}
        min="0"
        max="10"
        step="1"
        value={cvss}
        size="5"
        onChange={onChange}
      />
    </FormGroup>
  );
};

CvssBaseGroup.propTypes = {
  cvss: PropTypes.number,
  filter: PropTypes.filter,
  name: PropTypes.string,
  onChange: PropTypes.func,
};

export default CvssBaseGroup;
