/* Copyright (C) 2020-2021 Greenbone Networks GmbH
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

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import SeverityBar from 'web/components/bar/severitybar';

import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';

import Body from 'web/components/table/body';
import Data from 'web/components/table/data';
import Head from 'web/components/table/head';
import Header from 'web/components/table/header';
import Row from 'web/components/table/row';
import StripedTable from 'web/components/table/stripedtable';

import {Col} from 'web/entity/page';

import PropTypes from 'web/utils/proptypes';

const StyledDiv = styled.div`
  padding: 5px;
`;

const ResultRow = ({result}) => {
  const {id, nvt, severity} = result;
  return (
    <Row>
      <Data>
        <DetailsLink id={id} type="result">
          {isDefined(nvt.name) ? nvt.name : nvt.oid}
        </DetailsLink>
      </Data>
      <Data>
        <SeverityBar severity={severity} />
      </Data>
    </Row>
  );
};

ResultRow.propTypes = {
  result: PropTypes.object,
};

const StyledLayout = styled(Layout)`
  width: 100%;
  overflow: auto;
`;

const ResultTable = ({results}) => {
  return (
    <StyledLayout align="start" grow flex="column">
      <StripedTable>
        <colgroup>
          <Col width="55%" />
          <Col width="30%" />
          <Col width="15%" />
        </colgroup>
        <Header>
          <Row>
            <Head>{_('Result')}</Head>
            <Head>{_('Severity')}</Head>
          </Row>
        </Header>
        {isDefined(results) && results.length > 0 && (
          <Body>
            {results.map((result, i) => (
              <ResultRow key={i} result={result} />
            ))}
          </Body>
        )}
      </StripedTable>
      {isDefined(results) && results.length === 0 && (
        <StyledDiv>{_('No host selected.')}</StyledDiv>
      )}
    </StyledLayout>
  );
};

ResultTable.propTypes = {
  results: PropTypes.array,
};

export default ResultTable;

// vim: set ts=2 sw=2 tw=80:
