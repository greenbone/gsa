/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isFunction} from 'gmp/utils/identity';

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

const withRowDetails = (type, colSpan = '10') => Component => {
  const RowDetailsWrapper = ({entity, links = true, ...props}) => (
    <StyledTableRow>
      <TableData colSpan={colSpan} flex align={['start', 'stretch']}>
        {links && (
          <Layout align={['start', 'start']}>
            <DetailsLink
              type={isFunction(type) ? type(entity) : type}
              id={entity.id}
            >
              <DetailsIcon size="small" title={_('Open all details')} />
            </DetailsLink>
          </Layout>
        )}
        <Indent />
        <Layout flex="column" grow="1">
          <Component {...props} links={links} entity={entity} />
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
