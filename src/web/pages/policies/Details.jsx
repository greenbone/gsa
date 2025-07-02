/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import Divider from 'web/components/layout/Divider';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import TableBody from 'web/components/table/Body';
import Col from 'web/components/table/Col';
import TableData from 'web/components/table/Data';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const PolicyDetails = ({entity}) => {
  const [_] = useTranslation();
  const {comment, audits = []} = entity;
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
