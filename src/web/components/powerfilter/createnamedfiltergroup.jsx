/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
