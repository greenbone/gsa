/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import CloneIcon from 'web/entity/icon/CloneIcon';
import CreateIcon from 'web/entity/icon/CreateIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useTranslation from 'web/hooks/useTranslation';

const NoteDetailsPageToolBarIcons = ({
  entity,
  onNoteCloneClick,
  onNoteCreateClick,
  onNoteDeleteClick,
  onNoteDownloadClick,
  onNoteEditClick,
}) => {
  const [_] = useTranslation();
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="managing-notes"
          page="reports"
          title={_('Help: Notes')}
        />
        <ListIcon page="notes" title={_('Note List')} />
      </IconDivider>
      <IconDivider>
        <CreateIcon entity={entity} onClick={onNoteCreateClick} />
        <CloneIcon entity={entity} onClick={onNoteCloneClick} />
        <EditIcon entity={entity} onClick={onNoteEditClick} />
        <TrashIcon entity={entity} onClick={onNoteDeleteClick} />
        <ExportIcon
          title={_('Export Note as XML')}
          value={entity}
          onClick={onNoteDownloadClick}
        />
      </IconDivider>
    </Divider>
  );
};

export default NoteDetailsPageToolBarIcons;
