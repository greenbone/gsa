/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {typeName} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import Layout from 'web/components/layout/Layout';
import TableBody from 'web/components/table/Body';
import Col from 'web/components/table/Col';
import TableData from 'web/components/table/Data';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/Row';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {renderYesNo} from 'web/utils/Render';

const TagDetails = ({entity}) => {
  const [_] = useTranslation();
  const {comment, value, resourceType, resources} = entity;
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
            <TableData>{_('Value')}</TableData>
            <TableData>{value}</TableData>
          </TableRow>

          {isDefined(resources) && (
            <TableRow>
              <TableData>{_('Resource Type')}</TableData>
              <TableData>{typeName(resourceType)}</TableData>
            </TableRow>
          )}

          <TableRow>
            <TableData>{_('Active')}</TableData>
            <TableData>{renderYesNo(entity.isActive())}</TableData>
          </TableRow>
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

TagDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default TagDetails;

// vim: set ts=2 sw=2 tw=80:
