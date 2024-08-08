/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import styled from 'styled-components';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import Radio from 'web/components/form/radio';
import FormGroup from 'web/components/form/formgroup';

import SolutionTypeIcon from 'web/components/icon/solutiontypeicon';

import Table from 'web/components/table/table';
import TableBody from 'web/components/table/body';
import TableRow from 'web/components/table/row';
import TableData from 'web/components/table/data';

import Layout from 'web/components/layout/layout';
import Row from 'web/components/layout/row';

import useTranslation from 'web/hooks/useTranslation';

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
                    name="All"
                    onChange={handleSolutionTypeChange}
                  ></Radio>
                  <span>{_('All')}</span>
                </Row>
              </TableData>
              <TableData>
                <Row>
                  <Radio
                    checked={solutionType === 'Workaround'}
                    name="Workaround"
                    onChange={handleSolutionTypeChange}
                  />
                  <SolutionTypeIcon type="Workaround" />
                  <span>{_('Workaround')}</span>
                </Row>
              </TableData>
              <TableData>
                <Row>
                  <Radio
                    checked={solutionType === 'Mitigation'}
                    name="Mitigation"
                    onChange={handleSolutionTypeChange}
                  />
                  <SolutionTypeIcon type="Mitigation" />
                  <span>{_('Mitigation')}</span>
                </Row>
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                <Row>
                  <Radio
                    checked={solutionType === 'VendorFix'}
                    name="VendorFix"
                    onChange={handleSolutionTypeChange}
                  />
                  <SolutionTypeIcon type="VendorFix" />
                  <span>{_('Vendor fix')}</span>
                </Row>
              </TableData>
              <TableData>
                <Row>
                  <Radio
                    checked={solutionType === 'NoneAvailable'}
                    name="NoneAvailable"
                    onChange={handleSolutionTypeChange}
                  />
                  <SolutionTypeIcon type="NoneAvailable" />
                  <span>{_('None available')}</span>
                </Row>
              </TableData>
              <TableData>
                <Row>
                  <Radio
                    checked={solutionType === 'WillNotFix'}
                    name="WillNotFix"
                    onChange={handleSolutionTypeChange}
                  />
                  <SolutionTypeIcon type="WillNotFix" />
                  <span>{_('Will not fix')}</span>{' '}
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

// vim: set ts=2 sw=2 tw=80:
