/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Note from 'gmp/models/note';
import {shorten} from 'gmp/utils/string';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import RowDetailsToggle from 'web/entities/RowDetailsToggle';
import useTranslation from 'web/hooks/useTranslation';
import NoteTableActions, {
  type NoteTableActionsProps,
} from 'web/pages/notes/NoteTableActions';

export interface NoteTableRowProps extends NoteTableActionsProps {
  actionsComponent?: React.ComponentType<NoteTableActionsProps>;
  onToggleDetailsClick: (entity: Note, id: string) => void;
}

const NoteTableRow = ({
  actionsComponent: ActionsComponent = NoteTableActions,
  entity,
  onToggleDetailsClick,
  ...props
}: NoteTableRowProps) => {
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
          <RowDetailsToggle
            name={entity.id}
            onClick={
              onToggleDetailsClick as (entity: Note, name?: string) => void
            }
          >
            {text}
          </RowDetailsToggle>
        </span>
      </TableData>
      <TableData>{entity.nvt ? entity.nvt.name : ''}</TableData>
      <TableData title={entity.hosts.join(', ')}>
        {shorten(entity.hosts.join(', '))}
      </TableData>
      <TableData title={entity.port}>{shorten(entity.port)}</TableData>
      <TableData>{entity.isActive() ? _('yes') : _('no')}</TableData>
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

export default NoteTableRow;
