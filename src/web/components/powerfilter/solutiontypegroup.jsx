/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import Radio from 'web/components/form/radio';
import FormGroup from 'web/components/form/formgroup';

import SolutionTypeIcon from 'web/components/icon/solutiontypeicon';

import {isDefined} from 'gmp/utils/identity';

import Table from 'web/components/table/table';
import TableBody from 'web/components/table/body';
import TableRow from 'web/components/table/row';
import TableData from 'web/components/table/data';
import Layout from 'web/components/layout/layout';

import styled from 'styled-components';

const StyledLayout = styled(Layout)`
  flex-grow: 0;
`;

class SolutionTypesFilterGroup extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleSolutionTypeChange = this.handleSolutionTypeChange.bind(this);
  }

  handleSolutionTypeChange(value, solutionType) {
    const {filter, onChange} = this.props;
    const filteredSolutionType = filter.get('solution_type');

    if (!isDefined(solutionType) || solutionType === 'All') {
      onChange(filter.delete('solution_type'));
    } else if (solutionType !== filteredSolutionType) {
      onChange(filter.set('solution_type', solutionType));
    }
  }

  render() {
    const {filter} = this.props;

    const solutionType = filter.get('solution_type');

    return (
      <FormGroup title={_('Solution Type')}>
        <StyledLayout>
          <Table>
            <TableBody>
              <TableRow>
                <TableData>
                  <Radio
                    checked={!isDefined(solutionType) || solutionType === 'All'}
                    name="All"
                    onChange={this.handleSolutionTypeChange}
                    data-testid="filter_all"
                  >
                    <span>{_('All')}</span>
                  </Radio>
                </TableData>
                <TableData>
                  <Radio
                    checked={solutionType === 'Workaround'}
                    name="Workaround"
                    onChange={this.handleSolutionTypeChange}
                    data-testid="filter_workaround"
                  >
                    <SolutionTypeIcon type="Workaround" />
                    <span>{_('Workaround')}</span>
                  </Radio>
                </TableData>
                <TableData>
                  <Radio
                    checked={solutionType === 'Mitigation'}
                    name="Mitigation"
                    onChange={this.handleSolutionTypeChange}
                    data-testid="filter_mitigation"
                  >
                    <SolutionTypeIcon type="Mitigation" />
                    <span>{_('Mitigation')}</span>
                  </Radio>
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  <Radio
                    checked={solutionType === 'VendorFix'}
                    name="VendorFix"
                    onChange={this.handleSolutionTypeChange}
                    data-testid="filter_vendorfix"
                  >
                    <SolutionTypeIcon type="VendorFix" />
                    <span>{_('Vendor fix')}</span>
                  </Radio>
                </TableData>
                <TableData>
                  <Radio
                    checked={solutionType === 'NoneAvailable'}
                    name="NoneAvailable"
                    onChange={this.handleSolutionTypeChange}
                    data-testid="filter_none_available"
                  >
                    <SolutionTypeIcon type="NoneAvailable" />
                    <span>{_('None available')}</span>
                  </Radio>
                </TableData>
                <TableData>
                  <Radio
                    checked={solutionType === 'WillNotFix'}
                    name="WillNotFix"
                    onChange={this.handleSolutionTypeChange}
                    data-testid="filter_will_not_fix"
                  >
                    <SolutionTypeIcon type="WillNotFix" />
                    <span>{_('Will not fix')}</span>
                  </Radio>{' '}
                </TableData>
              </TableRow>
            </TableBody>
          </Table>
        </StyledLayout>
      </FormGroup>
    );
  }
}

SolutionTypesFilterGroup.propTypes = {
  filter: PropTypes.filter.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SolutionTypesFilterGroup;

// vim: set ts=2 sw=2 tw=80:
