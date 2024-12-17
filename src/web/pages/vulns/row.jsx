/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import SeverityBar from 'web/components/bar/severitybar';
import DateTime from 'web/components/date/datetime';
import DetailsLink from 'web/components/link/detailslink';
import Link from 'web/components/link/link';
import Qod from 'web/components/qod/qod';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';
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
          <DetailsLink id={entity.id} textOnly={!links} type="nvt">
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
          <Link filter={'nvt=' + entity.id} textOnly={!links} to="results">
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
