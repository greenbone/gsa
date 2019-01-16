/* Copyright (C) 2018-2019 Greenbone Networks GmbH
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
import {YES_VALUE, NO_VALUE} from 'gmp/parser';

import Checkbox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';
import Spinner from 'web/components/form/spinner';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

import {SEVERITY_CLASSES} from './usersettingspage';

const SeverityPart = ({
  defaultSeverity,
  dynamicSeverity,
  severityClass,
  onChange,
}) => (
  <React.Fragment>
    <FormGroup title={_('Severity Class')} titleSize="3">
      <Select
        name="severityClass"
        value={severityClass}
        items={renderSelectItems(SEVERITY_CLASSES)}
        onChange={onChange}
      />
    </FormGroup>
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
  severityClass: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default SeverityPart;

// vim: set ts=2 sw=2 tw=80:
