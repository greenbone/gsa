/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import SeverityBar from 'web/components/bar/SeverityBar';
import Comment from 'web/components/comment/Comment';
import DateTime from 'web/components/date/DateTime';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import EntitiesActions from 'web/entities/EntitiesActions';
import TableEntityName from 'web/entities/TableEntityName';
import PropTypes from 'web/utils/prop-types';
import {na} from 'web/utils/Render';

const Row = ({
  actionsComponent: ActionsComponent = EntitiesActions,
  entity,
  links = true,
  preview,
  ...props
}) => (
  <TableRow>
    <TableData>
      <span>
        <TableEntityName
          id={entity.id}
          links={links}
          preview={preview}
          type="cpe"
        >
          {entity.name}
        </TableEntityName>
      </span>
      <Comment text={entity.comment} />
    </TableData>
    <TableData>{na(entity.title)}</TableData>
    <TableData>
      <DateTime date={entity.modificationTime} />
    </TableData>
    <TableData>{entity.cveRefs}</TableData>
    <TableData>
      <SeverityBar severity={entity.severity} />
    </TableData>
    <ActionsComponent {...props} entity={entity} />
  </TableRow>
);

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
