/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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
import {YES_VALUE, NO_VALUE} from 'gmp/parser';

import Checkbox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';
import Spinner from 'web/components/form/spinner';

import PropTypes from 'web/utils/proptypes';

const SeverityPart = ({defaultSeverity, dynamicSeverity, onChange}) => (
  <React.Fragment>
    <FormGroup title={_('Dynamic Severity')} titleSize="3">
      <Checkbox
        name="dynamicSeverity"
        checked={dynamicSeverity === YES_VALUE}
        checkedValue={YES_VALUE}
        unCheckedValue={NO_VALUE}
        onChange={onChange}
      />
    </FormGroup>
    <FormGroup title={_('Default Severity')} titleSize="3">
      <Spinner
        name="defaultSeverity"
        value={defaultSeverity}
        min="0"
        max="10"
        step="0.1"
        type="float"
        onChange={onChange}
      />
    </FormGroup>
  </React.Fragment>
);

SeverityPart.propTypes = {
  defaultSeverity: PropTypes.number,
  dynamicSeverity: PropTypes.yesno,
  onChange: PropTypes.func.isRequired,
};

export default SeverityPart;

// vim: set ts=2 sw=2 tw=80:
