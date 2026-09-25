/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {NOTES_FILTER_FILTER} from 'gmp/models/filter';
import transformCreated from 'web/components/dashboard/display/created/created-transform';
import CreatedDisplay from 'web/components/dashboard/display/created/CreatedDisplay';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {NotesCreatedLoader} from 'web/pages/notes/dashboard/NoteLoaders';
import Theme from 'web/utils/theme';

export const NotesCreatedDisplay = createDisplay({
  loaderComponent: NotesCreatedLoader,
  displayComponent: props => (
    <CreatedDisplay
      {...props}
      dataTransform={transformCreated}
      title={() => _('Notes by Creation Time')}
      xAxisLabel={_('Time')}
      y2AxisLabel={_('Total Notes')}
      y2Line={{
        color: Theme.darkGreenTransparent,
        dashArray: '3, 2',
        label: _('Total Notes'),
      }}
      yAxisLabel={_('# of Created Notes')}
      yLine={{
        color: Theme.darkGreenTransparent,
        label: _('Created Notes'),
      }}
    />
  ),
  displayName: 'NotesCreatedDisplay',
  displayId: 'note-by-created',
  filtersFilter: NOTES_FILTER_FILTER,
});

export const NotesCreatedTableDisplay = createDisplay({
  loaderComponent: NotesCreatedLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      dataRow={transformedData =>
        transformedData?.map(row => [row.label ?? '', row.y, row.y2]) ?? []
      }
      dataTitles={[_('Creation Time'), _('# of Notes'), _('Total Notes')]}
      dataTransform={transformCreated}
      title={() => _('Notes by Creation Time')}
    />
  ),
  displayName: 'NotesCreatedTableDisplay',
  displayId: 'note-by-created-table',
  filtersFilter: NOTES_FILTER_FILTER,
});

registerDisplay(NotesCreatedDisplay, _l('Chart: Notes by Creation Time'));

registerDisplay(NotesCreatedTableDisplay, _l('Table: Notes by Creation Time'));
