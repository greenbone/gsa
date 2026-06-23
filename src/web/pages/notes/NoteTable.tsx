/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import type Note from 'gmp/models/note';
import createEntitiesFooter, {
  type CreateEntitiesFooterProps,
} from 'web/entities/createEntitiesFooter';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import withEntitiesHeader from 'web/entities/withEntitiesHeader';
import withRowDetails from 'web/entities/withRowDetails';
import NoteDetails from 'web/pages/notes/NoteDetails';
import NoteTableHeader, {
  type NoteTableHeaderProps,
} from 'web/pages/notes/NoteTableHeader';
import NoteRow, {type NoteRowProps} from 'web/pages/notes/NoteTableRow';

export default createEntitiesTable<
  Note,
  CreateEntitiesFooterProps<Note>,
  NoteTableHeaderProps,
  NoteRowProps
>({
  emptyTitle: _l('No Notes available'),
  footer: createEntitiesFooter<Note>({
    span: 10,
    trash: true,
    download: 'notes.xml',
  }),
  header: withEntitiesHeader()(NoteTableHeader),
  row: NoteRow,
  rowDetails: withRowDetails<Note>('note', 10)(NoteDetails),
});
