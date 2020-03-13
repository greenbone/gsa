/* Copyright (C) 2017-2020 Greenbone Networks GmbH
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

import {parseInt} from 'gmp/parser';

import PropTypes from '../../utils/proptypes.js';

import FormGroup from '../form/formgroup.js';
import Checkbox from '../form/checkbox.js';
import Radio from '../form/radio.js';

import Divider from '../layout/divider.js';

const AutoFpGroup = ({filter, onChange}) => {
  const autofp = filter.get('autofp');

  return (
    <FormGroup title={_('Auto-FP')} flex="column">
      <Divider flex="column">
        <Checkbox
          name="autofp"
          checkedValue={1}
          unCheckedValue={0}
          checked={autofp >= 1}
          title={_('Trust vendor security updates')}
          onChange={onChange}
        />
        <Divider>
          <Radio
            name="autofp"
            title={_('Full CVE match')}
            value={1}
            disabled={autofp === 0}
            checked={autofp === 1}
            convert={parseInt}
            onChange={onChange}
          />
          <Radio
            name="autofp"
            title={_('Partial CVE match')}
            value="2"
            disabled={autofp === 0}
            checked={autofp === 2}
            convert={parseInt}
            onChange={onChange}
          />
        </Divider>
      </Divider>
    </FormGroup>
  );
};

AutoFpGroup.propTypes = {
  filter: PropTypes.filter.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default AutoFpGroup;

// vim: set ts=2 sw=2 tw=80:
