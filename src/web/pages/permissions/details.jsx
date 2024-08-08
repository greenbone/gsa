/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {typeName, getEntityType} from 'gmp/utils/entitytype';

import PropTypes from 'web/utils/proptypes';
import {permissionDescription} from 'web/utils/render';

import EntityLink from 'web/entity/link';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import {Col} from 'web/entity/page';

const PermissionDetails = ({entity}) => {
  const {comment, name, resource, subject} = entity;
  return (
    <Layout grow flex="column">
      <InfoTable>
        <colgroup>
          <Col width="10%" />
          <Col width="90%" />
        </colgroup>
        <TableBody>
          {isDefined(comment) && (
            <TableRow>
              <TableData>{_('Comment')}</TableData>
              <TableData>{comment}</TableData>
            </TableRow>
          )}

          <TableRow>
            <TableData>{_('Description')}</TableData>
            <TableData>{permissionDescription(name, resource)}</TableData>
          </TableRow>

          {isDefined(resource) && (
            <TableRow>
              <TableData>{_('Resource')}</TableData>
              <TableData>
                <Divider>
                  <span>{typeName(getEntityType(resource))}</span>
                  <EntityLink entity={resource} />
                </Divider>
              </TableData>
            </TableRow>
          )}

          {isDefined(subject) && (
            <TableRow>
              <TableData>{_('Subject')}</TableData>
              <TableData>
                <Divider>
                  <span>{typeName(getEntityType(subject))}</span>
                  <EntityLink entity={subject} />
                </Divider>
              </TableData>
            </TableRow>
          )}
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

PermissionDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default PermissionDetails;

// vim: set ts=2 sw=2 tw=80:
