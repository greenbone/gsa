/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {NOTES_FILTER_FILTER} from 'gmp/models/filter';
import CreatedDisplay from 'web/components/dashboard/display/created/CreatedDisplay';
import transformCreated from 'web/components/dashboard/display/created/CreatedTransform';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {NotesCreatedLoader} from 'web/pages/notes/dashboard/Loaders';
import Theme from 'web/utils/theme';

export const NotesCreatedDisplay = createDisplay({
  loaderComponent: NotesCreatedLoader,
  displayComponent: CreatedDisplay,
  title: () => _('Notes by Creation Time'),
  yAxisLabel: _l('# of Created Notes'),
  y2AxisLabel: _l('Total Notes'),
  xAxisLabel: _l('Time'),
  yLine: {
    color: Theme.darkGreenTransparent,
    label: _l('Created Notes'),
  },
  y2Line: {
    color: Theme.darkGreenTransparent,
    dashArray: '3, 2',
    label: _l('Total Notes'),
  },
  displayName: 'NotesCreatedDisplay',
  displayId: 'note-by-created',
  filtersFilter: NOTES_FILTER_FILTER,
});

export const NotesCreatedTableDisplay = createDisplay({
  loaderComponent: NotesCreatedLoader,
  displayComponent: DataTableDisplay,
  title: () => _('Notes by Creation Time'),
  dataTitles: [_l('Creation Time'), _l('# of Notes'), _l('Total Notes')],
  dataRow: row => [row.label, row.y, row.y2],
  dataTransform: transformCreated,
  displayName: 'NotesCreatedTableDisplay',
  displayId: 'note-by-created-table',
  filtersFilter: NOTES_FILTER_FILTER,
});

registerDisplay(NotesCreatedDisplay, _l('Chart: Notes by Creation Time'));

registerDisplay(NotesCreatedTableDisplay, _l('Table: Notes by Creation Time'));
