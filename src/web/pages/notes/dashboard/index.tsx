/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type FilterType} from 'gmp/models/filter';
import Dashboard from 'web/components/dashboard/Dashboard';
import {
  NotesActiveDaysDisplay,
  NotesActiveDaysTableDisplay,
} from 'web/pages/notes/dashboard/NoteActiveDaysDisplay';
import {
  NotesCreatedDisplay,
  NotesCreatedTableDisplay,
} from 'web/pages/notes/dashboard/NoteCreatedDisplay';
import {
  NotesWordCloudDisplay,
  NotesWordCloudTableDisplay,
} from 'web/pages/notes/dashboard/NoteWordCloudDisplay';

interface NotesDashboardProps {
  filter?: FilterType;
  onFilterChanged?: (filter: FilterType) => void;
}

export const NOTES_DASHBOARD_ID = 'ce7b121-c609-47b0-ab57-fd020a0336f4a';

export const NOTES_DISPLAYS = [
  NotesActiveDaysDisplay.displayId,
  NotesCreatedDisplay.displayId,
  NotesWordCloudDisplay.displayId,
  NotesActiveDaysTableDisplay.displayId,
  NotesCreatedTableDisplay.displayId,
  NotesWordCloudTableDisplay.displayId,
];

const NotesDashboard = (props: NotesDashboardProps) => (
  <Dashboard
    {...props}
    defaultDisplays={[
      [
        NotesActiveDaysDisplay.displayId,
        NotesCreatedDisplay.displayId,
        NotesWordCloudDisplay.displayId,
      ],
    ]}
    id={NOTES_DASHBOARD_ID}
    permittedDisplays={NOTES_DISPLAYS}
  />
);

export default NotesDashboard;
