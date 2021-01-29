/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import {isDefined} from 'gmp/utils/identity';

import FormGroup from 'web/components/form/formgroup';
import Spinner from 'web/components/form/spinner';

import Divider from 'web/components/layout/divider';

import PropTypes from 'web/utils/proptypes';

const MinQodGroup = ({qod, onChange, filter, name = 'min_qod'}) => {
  if (!isDefined(qod) && isDefined(filter)) {
    qod = filter.get('min_qod');
  }
  return (
    <FormGroup title={_('QoD')}>
      <Divider>
        <span>{_('must be at least')}</span>
        <Spinner
          type="int"
          name={name}
          min="0"
          max="100"
          step="1"
          value={qod}
          size="1"
          onChange={onChange}
        />
        <span>%</span>
      </Divider>
    </FormGroup>
  );
};

MinQodGroup.propTypes = {
  filter: PropTypes.filter,
  name: PropTypes.string,
  qod: PropTypes.number,
  onChange: PropTypes.func,
};

export default MinQodGroup;

// vim: set ts=2 sw=2 tw=80:
