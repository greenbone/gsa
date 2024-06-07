/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import Checkbox from 'web/components/form/checkbox';
import TextField from 'web/components/form/textfield';
import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

const StyledLayout = styled(Layout)`
  margin-top: 15px;
`;

const CreateNamedFilterGroup = ({
  filterName = '',
  saveNamedFilter = false,
  onValueChange,
}) => (
  <StyledLayout>
    <Divider>
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
        size="20"
        maxLength="80"
        title={_('Filter Name')}
        value={filterName}
        onChange={onValueChange}
      />
    </Divider>
  </StyledLayout>
);

CreateNamedFilterGroup.propTypes = {
  filterName: PropTypes.string,
  saveNamedFilter: PropTypes.bool,
  onValueChange: PropTypes.func.isRequired,
};

export default CreateNamedFilterGroup;

// vim: set ts=2 sw=2 tw=80:
