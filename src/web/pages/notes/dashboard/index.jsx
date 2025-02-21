/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Dashboard from 'web/components/dashboard/Dashboard';
import {
  NotesActiveDaysDisplay,
  NotesActiveDaysTableDisplay,
} from 'web/pages/notes/dashboard/ActiveDaysDisplay';
import {NotesCreatedDisplay, NotesCreatedTableDisplay} from 'web/pages/notes/dashboard/CreatedDisplay';
import {
  NotesWordCloudDisplay,
  NotesWordCloudTableDisplay,
} from 'web/pages/notes/dashboard/WordCloudDisplay';

export const NOTES_DASHBOARD_ID = 'ce7b121-c609-47b0-ab57-fd020a0336f4a';

export const NOTES_DISPLAYS = [
  NotesActiveDaysDisplay.displayId,
  NotesCreatedDisplay.displayId,
  NotesWordCloudDisplay.displayId,
  NotesActiveDaysTableDisplay.displayId,
  NotesCreatedTableDisplay.displayId,
  NotesWordCloudTableDisplay.displayId,
];

const NotesDashboard = props => (
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
