/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import {_} from 'gmp/locale/lang';

import {shorten} from 'gmp/utils/string';

import SeverityBar from 'web/components/bar/severitybar';

import Comment from 'web/components/comment/comment';

import DateTime from 'web/components/date/datetime';

import Link from 'web/components/link/link';

import TableRow from 'web/components/table/row';
import TableData from 'web/components/table/data';

import EntitiesActions from 'web/entities/actions';
import {RowDetailsToggle} from 'web/entities/row';

import PropTypes from 'web/utils/proptypes';
import {isNumber} from 'gmp/utils/identity';
import useGmp from 'web/hooks/useGmp';

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
        <Link to="cvsscalculator" query={{cvssVector: entity.cvssBaseVector}}>
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
            {isNumber(epssPercentile) ? epssPercentile.toFixed(5) : _('N/A')}
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

// vim: set ts=2 sw=2 tw=80:
