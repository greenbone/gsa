/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import SeverityBar from 'web/components/bar/SeverityBar';
import Comment from 'web/components/comment/Comment';
import DateTime from 'web/components/date/DateTime';
import TableData from 'web/components/table/Data';
import TableRow from 'web/components/table/Row';
import EntitiesActions from 'web/entities/Actions';
import RowDetailsToggle from 'web/entities/RowDetailsToggle';
import PropTypes from 'web/utils/PropTypes';
import {na} from 'web/utils/Render';

const Row = ({
  actionsComponent: ActionsComponent = EntitiesActions,
  entity,
  onToggleDetailsClick,
  ...props
}) => (
  <TableRow>
    <TableData>
      <span>
        <RowDetailsToggle name={entity.id} onClick={onToggleDetailsClick}>
          {entity.name}
        </RowDetailsToggle>
      </span>
      <Comment text={entity.comment} />
    </TableData>
    <TableData>{na(entity.title)}</TableData>
    <TableData>
      <DateTime date={entity.creationTime} />
    </TableData>
    <TableData>{entity.cve_refs}</TableData>
    <TableData>
      <SeverityBar severity={entity.severity} />
    </TableData>
    <ActionsComponent {...props} entity={entity} />
  </TableRow>
);

Row.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default Row;
