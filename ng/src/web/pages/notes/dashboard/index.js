/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import PropTypes from '../../../utils/proptypes';

import Dashboard from '../../../components/dashboard2/dashboard';

import {
  NotesActiveDaysDisplay,
  NotesActiveDaysTableDisplay,
} from './activedaysdisplay';
import {NotesCreatedDisplay, NotesCreatedTableDisplay} from './createddisplay';
import {
  NotesWordCloudDisplay,
  NotesWordCloudTableDisplay,
} from './wordclouddisplay';

export const NOTES_DASHBOARD_ID = 'ce7b121-c609-47b0-ab57-fd020a0336f4';

const NotesDashboard = ({
  filter,
  onFilterChanged,
}) => (
  <Dashboard
    id={NOTES_DASHBOARD_ID}
    filter={filter}
    permittedDisplays={[
      NotesActiveDaysDisplay.displayId,
      NotesCreatedDisplay.displayId,
      NotesWordCloudDisplay.displayId,
      NotesActiveDaysTableDisplay.displayId,
      NotesCreatedTableDisplay.displayId,
      NotesWordCloudTableDisplay.displayId,
    ]}
    defaultContent={[
      [
        NotesActiveDaysDisplay.displayId,
        NotesCreatedDisplay.displayId,
        NotesWordCloudDisplay.displayId,
      ],
    ]}
    maxItemsPerRow={4}
    maxRows={4}
    onFilterChanged={onFilterChanged}
  />
);

NotesDashboard.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};

export default NotesDashboard;

// vim: set ts=2 sw=2 tw=80:
