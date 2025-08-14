/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import PortList from 'gmp/models/portlist';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableCol from 'web/components/table/TableCol';
import TableData, {TableDataAlignTop} from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';

interface PortListDetailsProps {
  entity: PortList;
  links?: boolean;
}

const PortListDetails = ({entity}: PortListDetailsProps) => {
  const [_] = useTranslation();
  const {
    comment,
    deprecated,
    portCount = {
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
          <TableCol width="10%" />
          <TableCol width="90%" />
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
            <TableData>{portCount.all}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('TCP Port Count')}</TableData>
            <TableData>{portCount.tcp}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('UDP Port Count')}</TableData>
            <TableData>{portCount.udp}</TableData>
          </TableRow>

          {targets.length > 0 && (
            <TableRow>
              <TableDataAlignTop>
                {_('Targets using this Port List')}
              </TableDataAlignTop>
              <TableData>
                {targets.map(target => {
                  return (
                    <span key={target.id}>
                      <DetailsLink id={target.id as string} type="target">
                        {target.name}
                      </DetailsLink>
                    </span>
                  );
                })}
              </TableData>
            </TableRow>
          )}
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

export default PortListDetails;
