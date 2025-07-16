/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {typeName, getEntityType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import Divider from 'web/components/layout/Divider';
import Layout from 'web/components/layout/Layout';
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableCol from 'web/components/table/TableCol';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import EntityLink from 'web/entity/Link';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {permissionDescription} from 'web/utils/Render';

const PermissionDetails = ({entity}) => {
  const [_] = useTranslation();
  const {comment, name, resource, subject} = entity;
  return (
    <Layout grow flex="column">
      <InfoTable>
        <colgroup>
          <TableCol width="10%" />
          <TableCol width="90%" />
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
