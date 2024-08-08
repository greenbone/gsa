/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import HorizontalSep from 'web/components/layout/horizontalsep';
import Layout from 'web/components/layout/layout';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import {Col} from 'web/entity/page';

const RoleDetails = ({entity, links = true}) => {
  const {users = [], comment} = entity;
  return (
    <Layout flex="column" grow>
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
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

RoleDetails.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default RoleDetails;

// vim: set ts=2 sw=2 tw=80:
