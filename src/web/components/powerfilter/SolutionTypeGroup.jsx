/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';
import FormGroup from 'web/components/form/FormGroup';
import Radio from 'web/components/form/Radio';
import SolutionTypeIcon from 'web/components/icon/SolutionTypeIcon';
import Layout from 'web/components/layout/Layout';
import Row from 'web/components/layout/Row';
import TableBody from 'web/components/table/Body';
import Table from 'web/components/table/Table';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
const StyledLayout = styled(Layout)`
  flex-grow: 0;
`;

const SolutionTypesFilterGroup = ({filter, onChange}) => {
  const [_] = useTranslation();
  const handleSolutionTypeChange = (value, solutionType) => {
    const filteredSolutionType = filter.get('solution_type');

    if (!isDefined(solutionType) || solutionType === 'All') {
      onChange(filter.copy().delete('solution_type'));
    } else if (solutionType !== filteredSolutionType) {
      onChange(filter.copy().set('solution_type', solutionType));
    }
  };

  const solutionType = filter.get('solution_type');

  return (
    <FormGroup title={_('Solution Type')}>
      <StyledLayout>
        <Table>
          <TableBody>
            <TableRow>
              <TableData>
                <Row>
                  <Radio
                    checked={!isDefined(solutionType) || solutionType === 'All'}
                    data-testid="filter-solution-all"
                    name="All"
                    title={_('All')}
                    onChange={handleSolutionTypeChange}
                  />
                </Row>
              </TableData>
              <TableData>
                <Row>
                  <Radio
                    checked={solutionType === 'Workaround'}
                    data-testid="filter-solution-workaround"
                    name="Workaround"
                    title={_('Workaround')}
                    onChange={handleSolutionTypeChange}
                  />
                  <SolutionTypeIcon type="Workaround" />
                </Row>
              </TableData>
              <TableData>
                <Row>
                  <Radio
                    checked={solutionType === 'Mitigation'}
                    data-testid="filter-solution-mitigation"
                    name="Mitigation"
                    title={_('Mitigation')}
                    onChange={handleSolutionTypeChange}
                  />
                  <SolutionTypeIcon type="Mitigation" />
                </Row>
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                <Row>
                  <Radio
                    checked={solutionType === 'VendorFix'}
                    data-testid="filter-solution-vendor-fix"
                    name="VendorFix"
                    title={_('Vendor Fix')}
                    onChange={handleSolutionTypeChange}
                  />
                  <SolutionTypeIcon type="VendorFix" />
                </Row>
              </TableData>
              <TableData>
                <Row>
                  <Radio
                    checked={solutionType === 'NoneAvailable'}
                    data-testid="filter-solution-none-available"
                    name="NoneAvailable"
                    title={_('None available')}
                    onChange={handleSolutionTypeChange}
                  />
                  <SolutionTypeIcon type="NoneAvailable" />
                </Row>
              </TableData>
              <TableData>
                <Row>
                  <Radio
                    checked={solutionType === 'WillNotFix'}
                    data-testid="filter-solution-will-not-fix"
                    name="WillNotFix"
                    title={_('Will not fix')}
                    onChange={handleSolutionTypeChange}
                  />
                  <SolutionTypeIcon type="WillNotFix" />
                </Row>
              </TableData>
            </TableRow>
          </TableBody>
        </Table>
      </StyledLayout>
    </FormGroup>
  );
};

SolutionTypesFilterGroup.propTypes = {
  filter: PropTypes.filter.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SolutionTypesFilterGroup;
