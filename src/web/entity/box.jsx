/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import DateTime from 'web/components/date/datetime';
import Layout from 'web/components/layout/layout';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import InfoTable from 'web/components/table/infotable';
import TableRow from 'web/components/table/row';
import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const Pre = styled.pre`
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const BoxLayout = styled(Layout)`
  border: 1px solid ${Theme.lightGray};
  padding: 5px;
  margin-bottom: 10px;
  width: 400px;
  & h3 {
    margin-top: 0;
  }
`;

const EntityBox = ({
  children,
  modified,
  end,
  text,
  title,
  toolbox,
  ...props
}) => {
  return (
    <BoxLayout {...props} align="space-between" flex="column">
      <Layout align={['space-between', 'start']}>
        <h3>{title}</h3>
        {isDefined(toolbox) && toolbox}
      </Layout>
      <Pre>{text}</Pre>
      {children}
      <InfoTable>
        <TableBody>
          {isDefined(end) && (
            <TableRow>
              <TableData>{_('Active until')}</TableData>
              <TableData>
                <DateTime date={end} />
              </TableData>
            </TableRow>
          )}
          <TableRow>
            <TableData>{_('Modified')}</TableData>
            <TableData>
              <DateTime date={modified} />
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>
    </BoxLayout>
  );
};

EntityBox.propTypes = {
  end: PropTypes.date,
  modified: PropTypes.date,
  text: PropTypes.string,
  title: PropTypes.string.isRequired,
  toolbox: PropTypes.element,
};

export default EntityBox;
