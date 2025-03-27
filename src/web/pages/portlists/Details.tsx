/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import TableBody from 'web/components/table/Body';
import TableData, {TableDataAlignTop} from 'web/components/table/Data';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/Row';
import {Col} from 'web/entity/Page';

interface Target {
  id: string;
  name: string;
}

interface PortListDetailsEntity {
  comment: string;
  deprecated: boolean;
  port_count: {
    all: number;
    tcp: number;
    udp: number;
  };
  targets: Target[];
}

interface PortListDetailsProps {
  entity: PortListDetailsEntity;
}

const PortListDetails: React.FC<PortListDetailsProps> = ({
  entity,
}: PortListDetailsProps) => {
  const {
    comment,
    deprecated,
    // eslint-disable-next-line @typescript-eslint/naming-convention
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

export default PortListDetails;
