/* Copyright (C) 2019-2022 Greenbone AG
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

import PropTypes from 'web/utils/proptypes';

import Checkbox from 'web/components/form/checkbox';
import TextField from 'web/components/form/textfield';

import Row from 'web/components/layout/row';

import useTranslation from 'web/hooks/useTranslation';

const CreateNamedFilterGroup = ({
  filterName = '',
  saveNamedFilter = false,
  onValueChange,
}) => {
  const [_] = useTranslation();
  return (
    <Row>
      <Checkbox
        data-testid="createnamedfiltergroup-checkbox"
        name="saveNamedFilter"
        checkedValue={true}
        unCheckedValue={false}
        checked={saveNamedFilter}
        title={_('Store filter as: ')}
        onChange={onValueChange}
      />
      <TextField
        data-testid="createnamedfiltergroup-textfield"
        disabled={!saveNamedFilter}
        name="filterName"
        placeholder={_('Filter Name')}
        grow="1"
        value={filterName}
        onChange={onValueChange}
      />
    </Row>
  );
};

CreateNamedFilterGroup.propTypes = {
  filterName: PropTypes.string,
  saveNamedFilter: PropTypes.bool,
  onValueChange: PropTypes.func.isRequired,
};

export default CreateNamedFilterGroup;

// vim: set ts=2 sw=2 tw=80:
