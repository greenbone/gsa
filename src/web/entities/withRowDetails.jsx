/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */




import _ from 'gmp/locale';
import {isFunction} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import DetailsIcon from 'web/components/icon/detailsicon';
import Layout from 'web/components/layout/layout';
import DetailsLink from 'web/components/link/detailslink';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';
import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

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
    const RowDetailsWrapper = ({entity, links = true, ...props}) => (
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

    RowDetailsWrapper.propTypes = {
      entity: PropTypes.model.isRequired,
      links: PropTypes.bool,
    };
    return RowDetailsWrapper;
  };

export default withRowDetails;

// vim: set ts=2 sw=2 tw=80:
