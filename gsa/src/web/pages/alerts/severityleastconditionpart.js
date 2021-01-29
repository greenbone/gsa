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

import _ from 'gmp/locale';

import Spinner from 'web/components/form/spinner';
import Radio from 'web/components/form/radio';

import Divider from 'web/components/layout/divider';

import PropTypes from 'web/utils/proptypes';
import withPrefix from 'web/utils/withPrefix';

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
