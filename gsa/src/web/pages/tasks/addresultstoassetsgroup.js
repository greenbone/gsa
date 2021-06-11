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

import FormGroup from 'web/components/form/formgroup';
import YesNoRadio from 'web/components/form/yesnoradio';

import PropTypes from 'web/utils/proptypes';
import {toBoolean} from './dialog';

export const AddResultsToAssetsGroup = ({createAssets, onChange}) => {
  return (
    <FormGroup title={_('Add results to Assets')}>
      <YesNoRadio
        name="createAssets"
        value={createAssets}
        onChange={onChange}
        yesValue={true}
        noValue={false}
        convert={toBoolean}
      />
    </FormGroup>
  );
};

AddResultsToAssetsGroup.propTypes = {
  createAssets: PropTypes.bool,
  onChange: PropTypes.func,
};

export default AddResultsToAssetsGroup;

// vim: set ts=2 sw=2 tw=80:
