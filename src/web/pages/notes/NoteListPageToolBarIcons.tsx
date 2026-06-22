/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {NewIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

interface NoteListPageToolBarIconsProps {
  onNoteCreateClick: () => void;
}

const NoteListPageToolBarIcons = ({
  onNoteCreateClick,
}: NoteListPageToolBarIconsProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();

  return (
    <IconDivider>
      <ManualIcon
        anchor="managing-notes"
        page="reports"
        title={_('Help: Notes')}
      />
      {capabilities.mayCreate('note') && (
        <NewIcon title={_('New Note')} onClick={onNoteCreateClick} />
      )}
    </IconDivider>
  );
};

export default NoteListPageToolBarIcons;
