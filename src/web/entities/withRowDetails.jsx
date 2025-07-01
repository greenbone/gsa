/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {isFunction} from 'gmp/utils/identity';
import {DetailsIcon} from 'web/components/icon';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import TableData from 'web/components/table/Data';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import Theme from 'web/utils/Theme';
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
  (type, colSpan = '10', details = true) =>
  Component => {
    const RowDetailsWrapper = ({entity, links = true, ...props}) => {
      const [_] = useTranslation();

      return (
        <StyledTableRow>
          <TableData flex align={['start', 'stretch']} colSpan={colSpan}>
            {links && (
              <Layout align={['start', 'start']}>
                {details && (
                  <DetailsLink
                    id={entity.id}
                    type={isFunction(type) ? type(entity) : type}
                  >
                    <DetailsIcon size="small" title={_('Open all details')} />
                  </DetailsLink>
                )}
              </Layout>
            )}
            <Indent />
            <Layout flex="column" grow="1">
              <Component {...props} entity={entity} links={links} />
            </Layout>
          </TableData>
        </StyledTableRow>
      );
    };

    RowDetailsWrapper.propTypes = {
      entity: PropTypes.model.isRequired,
      links: PropTypes.bool,
    };
    return RowDetailsWrapper;
  };

export default withRowDetails;
