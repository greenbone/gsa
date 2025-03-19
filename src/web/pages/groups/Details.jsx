/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import HorizontalSep from 'web/components/layout/HorizontalSep';
import Layout from 'web/components/layout/Layout';
import TableBody from 'web/components/table/Body';
import TableData from 'web/components/table/Data';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/Row';
import {Col} from 'web/entity/Page';
import PropTypes from 'web/utils/PropTypes';

const GroupDetails = ({entity, isSpecial}) => {
  const {users = [], comment} = entity;
  return (
    <Layout grow flex="column">
      <InfoTable>
        <colgroup>
          <Col width="10%" />
          <Col width="90%" />
        </colgroup>
        <TableBody>
          <TableRow>
            <TableData>{_('Comment')}</TableData>
            <TableData>{comment}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Users')}</TableData>
            <TableData>
              <HorizontalSep>
                {users.map(user => (
                  <span key={user}>{user}</span>
                ))}
              </HorizontalSep>
            </TableData>
          </TableRow>
          {isSpecial && (
            <TableRow>
              <TableData>{_('Note: ')}</TableData>
              <TableData>{_('Special group')}</TableData>
            </TableRow>
          )}
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

GroupDetails.propTypes = {
  entity: PropTypes.model.isRequired,
  isSpecial: PropTypes.bool,
};

export default GroupDetails;
