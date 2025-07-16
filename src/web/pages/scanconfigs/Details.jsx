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
import InfoTable from 'web/components/table/InfoTable';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const ScanConfigDetails = ({entity}) => {
  const [_] = useTranslation();
  const {comment, deprecated, tasks = []} = entity;
  return (
    <Layout grow flex="column">
      <InfoTable>
        <colgroup>
          <Col width="10%" />
          <Col width="90%" />
        </colgroup>
        <TableBody>
          {deprecated && (
            <TableRow>
              <TableData>{_('Deprecated')}</TableData>
              <TableData>{_('yes')}</TableData>
            </TableRow>
          )}
          {isDefined(comment) && (
            <TableRow>
              <TableData>{_('Comment')}</TableData>
              <TableData>{comment}</TableData>
            </TableRow>
          )}
          {tasks.length > 0 && (
            <TableRow>
              <TableData>{_('Tasks using this Scan Config')}</TableData>
              <TableData>
                <Divider wrap>
                  {tasks.map((task, index) => {
                    return (
                      <React.Fragment key={task.id}>
                        <DetailsLink id={task.id} type="task">
                          {task.name}
                        </DetailsLink>
                        {index !== tasks.length - 1 && ','}
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

ScanConfigDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default ScanConfigDetails;
