/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import Model from 'gmp/models/model';
import {isFunction} from 'gmp/utils/identity';
import {DetailsIcon} from 'web/components/icon';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import {updateDisplayName} from 'web/utils/displayName';
import Theme from 'web/utils/Theme';

interface RowDetailsWrapperProps<TEntity> {
  entity: TEntity;
  links?: boolean;
}

const Indent = styled.div`
  display: flex;
  width: 3em;
  border-right: 2px solid ${Theme.black};
  margin-right: 1em;
  flex-shrink: 0; /* don't shrink at all */
`;

Indent.displayName = 'Indent';

const StyledTableRow = styled(TableRow)`
  &,
  &:hover {
    background-color: ${Theme.white} !important;
  }
  & td {
    border-bottom: none;
  }
`;

const withRowDetails =
  <TEntity extends Model, TProps = {}>(
    type: string,
    colSpan: number = 10,
    details: boolean = true,
  ) =>
  (
    Component: React.ComponentType<
      RowDetailsWrapperProps<TEntity> &
        Omit<TProps, keyof RowDetailsWrapperProps<TEntity>>
    >,
  ) => {
    const RowDetailsWrapper = ({
      entity,
      links = true,
      ...props
    }: RowDetailsWrapperProps<TEntity> & TProps) => {
      const [_] = useTranslation();

      return (
        <StyledTableRow>
          <TableData flex align={['start', 'stretch']} colSpan={colSpan}>
            {links && (
              <Layout align={['start', 'start']}>
                {details && (
                  <DetailsLink
                    id={entity.id as string}
                    type={isFunction(type) ? type(entity) : type}
                  >
                    <DetailsIcon size="small" title={_('Open all details')} />
                  </DetailsLink>
                )}
              </Layout>
            )}
            <Indent />
            <Layout flex="column" grow="1">
              <Component {...(props as TProps)} entity={entity} links={links} />
            </Layout>
          </TableData>
        </StyledTableRow>
      );
    };

    return updateDisplayName(RowDetailsWrapper, Component, 'withRowDetails');
  };

export default withRowDetails;
