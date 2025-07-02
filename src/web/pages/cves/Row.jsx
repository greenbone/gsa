/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_} from 'gmp/locale/lang';
import {isNumber} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import SeverityBar from 'web/components/bar/SeverityBar';
import Comment from 'web/components/comment/Comment';
import DateTime from 'web/components/date/DateTime';
import Link from 'web/components/link/Link';
import TableData from 'web/components/table/Data';
import TableRow from 'web/components/table/TableRow';
import EntitiesActions from 'web/entities/Actions';
import RowDetailsToggle from 'web/entities/RowDetailsToggle';
import useGmp from 'web/hooks/useGmp';
import PropTypes from 'web/utils/PropTypes';
import {printPercentile} from 'web/utils/severity';

const Row = ({
  actionsComponent: ActionsComponent = EntitiesActions,
  entity,
  onToggleDetailsClick,
  ...props
}) => {
  const gmp = useGmp();
  const epssScore = entity?.epss?.score;
  const epssPercentile = entity?.epss?.percentile;
  return (
    <TableRow>
      <TableData>
        <span>
          <RowDetailsToggle name={entity.id} onClick={onToggleDetailsClick}>
            {entity.name}
          </RowDetailsToggle>
        </span>
        <Comment text={entity.comment} />
      </TableData>
      <TableData>{shorten(entity.description, 160)}</TableData>
      <TableData>
        <DateTime date={entity.creationTime} />
      </TableData>
      <TableData>
        <Link query={{cvssVector: entity.cvssBaseVector}} to="cvsscalculator">
          {entity.cvssBaseVector}
        </Link>
      </TableData>
      <TableData>
        <SeverityBar severity={entity.severity} />
      </TableData>
      {gmp.settings.enableEPSS && (
        <>
          <TableData>
            {isNumber(epssScore)
              ? `${(epssScore * 100).toFixed(3)}%`
              : _('N/A')}
          </TableData>
          <TableData>{printPercentile(epssPercentile)}</TableData>
        </>
      )}
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

Row.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default Row;
