/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_} from 'gmp/locale/lang';
import {isNumber} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import React from 'react';
import SeverityBar from 'web/components/bar/severitybar';
import Comment from 'web/components/comment/comment';
import DateTime from 'web/components/date/datetime';
import Link from 'web/components/link/link';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';
import EntitiesActions from 'web/entities/actions';
import {RowDetailsToggle} from 'web/entities/row';
import useGmp from 'web/hooks/useGmp';
import PropTypes from 'web/utils/proptypes';

const Row = ({
  actionsComponent: ActionsComponent = EntitiesActions,
  entity,
  links = true,
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
            {isNumber(epssScore) ? epssScore.toFixed(5) : _('N/A')}
          </TableData>
          <TableData>
            {isNumber(epssPercentile)
              ? `${(epssPercentile * 100).toFixed(3)}%`
              : _('N/A')}
          </TableData>
        </>
      )}
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

Row.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default Row;
