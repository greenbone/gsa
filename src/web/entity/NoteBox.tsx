/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Note from 'gmp/models/note';
import {DetailsIcon} from 'web/components/icon';
import IconDivider from 'web/components/layout/IconDivider';
import DetailsLink from 'web/components/link/DetailsLink';
import EntityBox from 'web/entity/EntityBox';
import useTranslation from 'web/hooks/useTranslation';

interface NoteBoxProps {
  note: Note;
  detailsLink?: boolean;
  'data-testid'?: string;
}

const NoteBox = ({
  note,
  detailsLink = true,
  'data-testid': dataTestId = 'note-box',
}: NoteBoxProps) => {
  const [_] = useTranslation();
  const toolbox = detailsLink ? (
    <IconDivider>
      <DetailsLink id={note.id as string} title={_('Note Details')} type="note">
        <DetailsIcon />
      </DetailsLink>
    </IconDivider>
  ) : undefined;
  const title = _('Note');
  return (
    <EntityBox
      aria-label={title}
      data-testid={dataTestId}
      end={note.endTime}
      modified={note.modificationTime}
      text={note.text}
      title={title}
      toolbox={toolbox}
    />
  );
};

export default NoteBox;
