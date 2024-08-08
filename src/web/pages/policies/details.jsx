/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import {Col} from 'web/entity/page';

const PolicyDetails = ({entity}) => {
  const {comment, audits = []} = entity;
  return (
    <Layout flex="column" grow>
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
          {audits.length > 0 && (
            <TableRow>
              <TableData>{_('Audits using this Policy')}</TableData>
              <TableData>
                <Divider wrap>
                  {audits.map((audit, index) => {
                    return (
                      <React.Fragment key={audit.id}>
                        <DetailsLink id={audit.id} type="audit">
                          {audit.name}
                        </DetailsLink>
                        {index !== audits.length - 1 && ','}
                      </React.Fragment>
                    );
                  })}
                </Divider>
              </TableData>
            </TableRow>
          )}
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

PolicyDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default PolicyDetails;

// vim: set ts=2 sw=2 tw=80:
