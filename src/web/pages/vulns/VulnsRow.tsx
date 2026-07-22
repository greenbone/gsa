/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Vulnerability from 'gmp/models/vulnerability';
import SeverityBar from 'web/components/bar/SeverityBar';
import DateTime from 'web/components/date/DateTime';
import DetailsLink from 'web/components/link/DetailsLink';
import Link from 'web/components/link/Link';
import Qod from 'web/components/qod/Qod';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import EntitiesActions from 'web/entities/EntitiesActions';
import {type SelectionTypeType} from 'web/utils/SelectionType';

interface RowProps {
  entity: Vulnerability;
  links?: boolean;
  selectionType?: SelectionTypeType;
  onEntityDeselected?: (entity: Vulnerability) => void;
  onEntitySelected?: (entity: Vulnerability) => void;
}

const Row = ({
  entity,
  links = true,
  selectionType,
  onEntityDeselected,
  onEntitySelected,
}: RowProps) => {
  const {results = {}, hosts = {}} = entity;
  return (
    <TableRow>
      <TableData>
        <span>
          <DetailsLink id={entity.id ?? ''} textOnly={!links} type="nvt">
            {entity.name ?? ''}
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
        <Qod value={entity.qod as number | string} />
      </TableData>
      <TableData>
        <span>
          <Link filter={'nvt=' + entity.id} textOnly={!links} to="results">
            {results.count}
          </Link>
        </span>
      </TableData>
      <TableData>{hosts.count}</TableData>
      <EntitiesActions
        entity={entity}
        selectionType={selectionType}
        onEntityDeselected={onEntityDeselected}
        onEntitySelected={onEntitySelected}
      />
    </TableRow>
  );
};

export default Row;
