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

import Layout from '../components/layout/layout.js';

import PropTypes from '../proptypes.js';
import {withPrefix} from '../render.js';

import Select2 from '../components/form/select2.js';
import Radio from '../components/form/radio.js';

const VALUE = 'Severity changed';

const SeverityChangedConditionPart = ({
    condition,
    direction,
    prefix,
    onChange,
  }) => {
  return (
    <Layout flex box>
      <Radio title={_('Severity Level')}
        value={VALUE}
        name="condition"
        checked={condition === VALUE}
        onChange={onChange}>
      </Radio>
      <Select2
        value={direction}
        name={prefix + 'direction'}
        onChange={onChange}>
        <option value="changed">{_('changed')}</option>
        <option value="increased">{_('increased')}</option>
        <option value="decreased">{_('decreased')}</option>
      </Select2>
    </Layout>
  );
};

SeverityChangedConditionPart.propTypes = {
  condition: PropTypes.string.isRequired,
  direction: PropTypes.string.isRequired,
  prefix: PropTypes.string,
  onChange: PropTypes.func,
};

export default withPrefix(SeverityChangedConditionPart);

// vim: set ts=2 sw=2 tw=80:
