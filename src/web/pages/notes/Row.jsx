/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {shorten} from 'gmp/utils/string';
import React from 'react';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import TableData from 'web/components/table/Data';
import TableRow from 'web/components/table/Row';
import RowDetailsToggle from 'web/entities/RowDetailsToggle';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const Actions = withEntitiesActions(
  ({
    entity,
    onNoteDeleteClick,
    onNoteDownloadClick,
    onNoteCloneClick,
    onNoteEditClick,
  }) => {
    const [_] = useTranslation();

    return (
      <IconDivider grow align={['center', 'center']}>
        <TrashIcon entity={entity} name="note" onClick={onNoteDeleteClick} />
        <EditIcon entity={entity} name="note" onClick={onNoteEditClick} />
        <CloneIcon entity={entity} name="note" onClick={onNoteCloneClick} />
        <ExportIcon
          title={_('Export Note')}
          value={entity}
          onClick={onNoteDownloadClick}
        />
      </IconDivider>
    );
  },
);

Actions.propTypes = {
  entity: PropTypes.model,
  onNoteCloneClick: PropTypes.func.isRequired,
  onNoteDeleteClick: PropTypes.func.isRequired,
  onNoteDownloadClick: PropTypes.func.isRequired,
  onNoteEditClick: PropTypes.func.isRequired,
};

const Row = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  onToggleDetailsClick,
  ...props
}) => {
  const [_] = useTranslation();
  const text = (
    <div>
      {entity.isOrphan() && (
        <div>
          <b>{_('Orphan')}</b>
        </div>
      )}
      {shorten(entity.text)}
    </div>
  );
  return (
    <TableRow>
      <TableData>
        <span>
          <RowDetailsToggle name={entity.id} onClick={onToggleDetailsClick}>
            {text}
          </RowDetailsToggle>
        </span>
      </TableData>
      <TableData>{entity.nvt ? entity.nvt.name : ''}</TableData>
      <TableData title={entity.hosts}>
        {shorten(entity.hosts.join(', '))}
      </TableData>
      <TableData title={entity.port}>{shorten(entity.port)}</TableData>
      <TableData>{entity.isActive() ? _('yes') : _('no')}</TableData>
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
