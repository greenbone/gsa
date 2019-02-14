/* Copyright (C) 2016-2019 Greenbone Networks GmbH
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

import Divider from '../../components/layout/divider.js';

import PropTypes from '../../utils/proptypes.js';
import withPrefix from '../../utils/withPrefix.js';

import Spinner from '../../components/form/spinner.js';
import Radio from '../../components/form/radio.js';

const VALUE = 'Severity at least';

const SeverityLeastConditionPart = ({
  condition,
  severity,
  prefix,
  onChange,
}) => {
  return (
    <Divider>
      <Radio
        title={_('Severity at least')}
        value={VALUE}
        checked={condition === VALUE}
        name="condition"
        onChange={onChange}
      />
      <Spinner
        value={severity}
        name={prefix + 'severity'}
        type="float"
        min="0"
        size="5"
        onChange={onChange}
      />
    </Divider>
  );
};

SeverityLeastConditionPart.propTypes = {
  condition: PropTypes.string.isRequired,
  prefix: PropTypes.string,
  severity: PropTypes.number.isRequired,
  onChange: PropTypes.func,
};

export default withPrefix(SeverityLeastConditionPart);

// vim: set ts=2 sw=2 tw=80:
