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

import PropTypes from 'web/utils/proptypes';

const ResultsPerPageGroup = ({rows, filter, onChange, name = 'rows'}) => {
  if (isDefined(filter)) {
    rows = filter.get('rows');
  }

  return (
    <FormGroup title={_('Results per page')}>
      <Spinner
        type="int"
        name={name}
        value={rows}
        size="5"
        onChange={onChange}
      />
    </FormGroup>
  );
};

ResultsPerPageGroup.propTypes = {
  filter: PropTypes.filter,
  name: PropTypes.string,
  rows: PropTypes.number,
  onChange: PropTypes.func,
};

export default ResultsPerPageGroup;

// vim: set ts=2 sw=2 tw=80:
