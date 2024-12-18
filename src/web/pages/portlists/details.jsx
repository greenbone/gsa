/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import Layout from 'web/components/layout/layout';
import DetailsLink from 'web/components/link/detailslink';
import TableBody from 'web/components/table/body';
import TableData, {TableDataAlignTop} from 'web/components/table/data';
import InfoTable from 'web/components/table/infotable';
import TableRow from 'web/components/table/row';
import {Col} from 'web/entity/page';
import PropTypes from 'web/utils/proptypes';

const PortListDetails = ({entity, ...props}) => {
  const {
    comment,
    deprecated,
    port_count = {
      all: 0,
      tcp: 0,
      udp: 0,
    },
    targets = [],
  } = entity;
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

          <TableRow>
            <TableData>{_('Comment')}</TableData>
            <TableData>{comment}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Port Count')}</TableData>
            <TableData>{port_count.all}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('TCP Port Count')}</TableData>
            <TableData>{port_count.tcp}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('UDP Port Count')}</TableData>
            <TableData>{port_count.udp}</TableData>
          </TableRow>

          {targets.length > 0 && (
            <TableRow>
              <TableDataAlignTop>
                {_('Targets using this Port List')}
              </TableDataAlignTop>
              <TableData>
                {targets.map(target => (
                  <span key={target.id}>
                    <DetailsLink id={target.id} type="target">
                      {target.name}
                    </DetailsLink>
                  </span>
                ))}
              </TableData>
            </TableRow>
          )}
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

PortListDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default PortListDetails;
