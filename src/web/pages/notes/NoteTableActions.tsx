/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Note from 'gmp/models/note';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import EntitiesActions, {
  type EntitiesActionsProps,
} from 'web/entities/EntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useTranslation from 'web/hooks/useTranslation';

export interface NoteActionsProps extends Omit<
  EntitiesActionsProps<Note>,
  'children'
> {
  onNoteDeleteClick?: (note: Note) => void | Promise<void>;
  onNoteDownloadClick?: (note: Note) => void | Promise<void>;
  onNoteCloneClick?: (note: Note) => void | Promise<void>;
  onNoteEditClick?: (note: Note) => void | Promise<void>;
}

const NoteActions = ({
  'data-testid': dataTestId,
  entity,
  selectionType,
  onEntityDeselected,
  onEntitySelected,
  onNoteDeleteClick,
  onNoteDownloadClick,
  onNoteCloneClick,
  onNoteEditClick,
}: NoteActionsProps) => {
  const [_] = useTranslation();
  return (
    <EntitiesActions<Note>
      data-testid={dataTestId}
      entity={entity}
      selectionType={selectionType}
      onEntityDeselected={onEntityDeselected}
      onEntitySelected={onEntitySelected}
    >
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
    </EntitiesActions>
  );
};

export default NoteActions;
