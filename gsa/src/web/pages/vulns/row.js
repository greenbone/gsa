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

import DateTime from 'web/components/date/datetime';

import DetailsLink from 'web/components/link/detailslink';
import Link from 'web/components/link/link';

import SeverityBar from 'web/components/bar/severitybar';

import TableRow from 'web/components/table/row';
import TableData from 'web/components/table/data';

import Qod from 'web/components/qod/qod';

import EntitiesActions from 'web/entities/actions';

import PropTypes from 'web/utils/proptypes';

const Row = ({
  actionsComponent: ActionsComponent = EntitiesActions,
  entity,
  links = true,
  ...props
}) => {
  const {results = {}, hosts = {}} = entity;
  return (
    <TableRow>
      <TableData>
        <span>
          <DetailsLink type="nvt" id={entity.id} textOnly={!links}>
            {entity.name}
          </DetailsLink>
        </span>
      </TableData>
      <TableData>
        <DateTime date={results.oldest} />
      </TableData>
      <TableData>
        <DateTime date={results.newest} />
      </TableData>
      <TableData>
        <SeverityBar severity={entity.severity} />
      </TableData>
      <TableData align="center">
        <Qod value={entity.qod} />
      </TableData>
      <TableData>
        <span>
          <Link to="results" filter={'nvt=' + entity.id} textOnly={!links}>
            {results.count}
          </Link>
        </span>
      </TableData>
      <TableData>{hosts.count}</TableData>
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

Row.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.object.isRequired,
  links: PropTypes.bool,
};

export default Row;

// vim: set ts=2 sw=2 tw=80:
