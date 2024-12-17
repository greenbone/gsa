/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import SeverityBar from 'web/components/bar/severitybar';
import Comment from 'web/components/comment/comment';
import DateTime from 'web/components/date/datetime';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';
import EntitiesActions from 'web/entities/actions';
import {RowDetailsToggle} from 'web/entities/row';
import PropTypes from 'web/utils/proptypes';
import {na} from 'web/utils/render';

const Row = ({
  actionsComponent: ActionsComponent = EntitiesActions,
  entity,
  links = true,
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
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default Row;
