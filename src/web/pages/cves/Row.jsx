/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {shorten} from 'gmp/utils/string';
import SeverityBar from 'web/components/bar/SeverityBar';
import Comment from 'web/components/comment/Comment';
import DateTime from 'web/components/date/DateTime';
import Link from 'web/components/link/Link';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import EntitiesActions from 'web/entities/EntitiesActions';
import TableEntityName from 'web/entities/TableEntityName';
import useGmp from 'web/hooks/useGmp';
import {ROUTES} from 'web/route-paths';
import PropTypes from 'web/utils/prop-types';
import {renderPercentile, renderScore} from 'web/utils/severity';

const Row = ({
  actionsComponent: ActionsComponent = EntitiesActions,
  entity,
  links = true,
  preview,
  ...props
}) => {
  const gmp = useGmp();
  const epssScore = entity?.epss?.score;
  const epssPercentile = entity?.epss?.percentile;
  return (
    <TableRow>
      <TableData>
        <span>
          <TableEntityName
            id={entity.id}
            links={links}
            preview={preview}
            type="cve"
          >
            {entity.name}
          </TableEntityName>
        </span>
        <Comment text={entity.comment} />
      </TableData>
      <TableData>{shorten(entity.description, 160)}</TableData>
      <TableData>
        <DateTime date={entity.creationTime} />
      </TableData>
      <TableData>
        <Link
          query={{cvssVector: entity.cvssBaseVector}}
          to={ROUTES.cvssCalculator.path}
        >
          {entity.cvssBaseVector}
        </Link>
      </TableData>
      <TableData>
        <SeverityBar severity={entity.severity} />
      </TableData>
      {gmp.settings.enableEPSS && (
        <>
          <TableData>{renderScore(epssScore)}</TableData>
          <TableData>{renderPercentile(epssPercentile)}</TableData>
        </>
      )}
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

Row.propTypes = {
  links: PropTypes.bool,
  actionsComponent: PropTypes.component,
  entity: PropTypes.model,
  preview: PropTypes.shape({
    expanded: PropTypes.bool.isRequired,
    id: PropTypes.string,
    toggle: PropTypes.func.isRequired,
  }),
};

export default Row;
