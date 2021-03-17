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

import Filter from 'gmp/models/filter';

import {isDefined} from 'gmp/utils/identity';

import SeverityBar from 'web/components/bar/severitybar';

import DateTime from 'web/components/date/datetime';

import SolutionTypeIcon from 'web/components/icon/solutiontypeicon';

import Divider from 'web/components/layout/divider';

import CveLink from 'web/components/link/cvelink';
import Link from 'web/components/link/link';

import TableRow from 'web/components/table/row';
import TableData from 'web/components/table/data';

import Qod from 'web/components/qod/qod';

import EntitiesActions from 'web/entities/actions';
import {RowDetailsToggle} from 'web/entities/row';

import PropTypes from 'web/utils/proptypes';

const Row = ({
  actionsComponent: ActionsComponent = EntitiesActions,
  entity,
  links = true,
  onFilterChanged,
  onToggleDetailsClick,
  ...props
}) => {
  const handleFilterChanged = () => {
    const filter = Filter.fromString('family="' + entity.family + '"');
    onFilterChanged(filter);
  };

  return (
    <TableRow>
      <TableData>
        <span>
          <RowDetailsToggle name={entity.id} onClick={onToggleDetailsClick}>
            {entity.name}
          </RowDetailsToggle>
        </span>
      </TableData>
      <TableData>
        <span>
          <Link
            to="nvts"
            filter={'family="' + entity.family + '"'}
            textOnly={!links}
            onClick={handleFilterChanged}
          >
            {entity.family}
          </Link>
        </span>
      </TableData>
      <TableData>
        <DateTime date={entity.creationTime} />
      </TableData>
      <TableData>
        <DateTime date={entity.modificationTime} />
      </TableData>
      <TableData>
        <Divider wrap>
          {entity.cves.map(id => (
            <CveLink key={id} id={id} textOnly={!links} />
          ))}
        </Divider>
      </TableData>
      <TableData align="center">
        {isDefined(entity?.solution) && (
          <SolutionTypeIcon type={entity.solution.type} />
        )}
      </TableData>
      <TableData>
        <SeverityBar severity={entity.severity} />
      </TableData>
      <TableData align="end">
        {entity.qod && <Qod value={entity.qod.value} />}
      </TableData>
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

Row.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onFilterChanged: PropTypes.func.isRequired,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default Row;

// vim: set ts=2 sw=2 tw=80:
