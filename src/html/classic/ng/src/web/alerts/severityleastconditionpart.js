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

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';
import {withPrefix} from '../render.js';

import Spinner from '../form/spinner.js';
import Radio from '../form/radio.js';

const VALUE = 'Severity at least';

const SeverityLeastConditionPart = ({
    condition,
    severity,
    prefix,
    onChange,
  }) => {
  return (
    <Layout flex box>
      <Radio title={_('Severity at least')}
        value={VALUE}
        checked={condition === VALUE}
        name="condition"
        onChange={onChange}>
      </Radio>
      <Spinner
        value={severity}
        name={prefix + 'severity'}
        type="float"
        min="0"
        size="5"
        onChange={onChange}/>
    </Layout>
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
