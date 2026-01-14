/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import {type Date} from 'gmp/models/date';
import {isDefined} from 'gmp/utils/identity';
import DateTime from 'web/components/date/DateTime';
import Layout, {type LayoutProps} from 'web/components/layout/Layout';
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/Theme';

interface EntityBoxProps extends LayoutProps {
  end?: Date;
  modified?: Date;
  text?: string;
  title: string;
  toolbox?: React.ReactElement;
}

const Pre = styled.pre`
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const BoxLayout = styled(Layout)`
  border: 1px solid ${Theme.lightGray};
  padding: 5px;
  margin-bottom: 10px;
  width: 400px;
  & h3 {
    margin-top: 0;
  }
`;

const EntityBox = ({
  children,
  modified,
  end,
  text,
  title,
  toolbox,
  ...props
}: EntityBoxProps) => {
  const [_] = useTranslation();
  return (
    <BoxLayout {...props} align="space-between" flex="column">
      <Layout align={['space-between', 'start']}>
        <h3>{title}</h3>
        {isDefined(toolbox) && toolbox}
      </Layout>
      <Pre>{text}</Pre>
      {children}
      <InfoTable>
        <TableBody>
          {isDefined(end) && (
            <TableRow>
              <TableData>{_('Active until')}</TableData>
              <TableData>
                <DateTime date={end} />
              </TableData>
            </TableRow>
          )}
          <TableRow>
            <TableData>{_('Modified')}</TableData>
            <TableData>
              <DateTime date={modified} />
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>
    </BoxLayout>
  );
};

export default EntityBox;
