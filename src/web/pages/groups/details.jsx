/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import _ from 'gmp/locale';
import React from 'react';
import HorizontalSep from 'web/components/layout/horizontalsep';
import Layout from 'web/components/layout/layout';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import InfoTable from 'web/components/table/infotable';
import TableRow from 'web/components/table/row';
import {Col} from 'web/entity/page';
import PropTypes from 'web/utils/proptypes';

const GroupDetails = ({entity, isSpecial, links}) => {
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
  links: PropTypes.bool,
};

export default GroupDetails;

// vim: set ts=2 sw=2 tw=80:
