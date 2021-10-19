/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import Loader, {
  loadFunc,
  loaderPropTypes,
} from 'web/store/dashboard/data/loader';

export const NOTES_ACTIVE_DAYS = 'notes-active-days';
export const NOTES_CREATED = 'notes-created';
export const NOTES_WORDCOUNT = 'notes-wordcount';

export const notesActiveDaysLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.notes.getActiveDaysAggregates({filter}).then(r => r.data),
  NOTES_ACTIVE_DAYS,
);

export const NotesActiveDaysLoader = ({filter, children}) => (
  <Loader
    dataId={NOTES_ACTIVE_DAYS}
    filter={filter}
    load={notesActiveDaysLoader}
    subscriptions={['notes.timer', 'notes.changed']}
  >
    {children}
  </Loader>
);

NotesActiveDaysLoader.propTypes = loaderPropTypes;

export const notesCreatedLoader = loadFunc(
  ({gmp, filter}) => gmp.notes.getCreatedAggregates({filter}).then(r => r.data),
  NOTES_CREATED,
);

export const NotesCreatedLoader = ({filter, children}) => (
  <Loader
    dataId={NOTES_CREATED}
    filter={filter}
    load={notesCreatedLoader}
    subscriptions={['notes.timer', 'notes.changed']}
  >
    {children}
  </Loader>
);

NotesCreatedLoader.propTypes = loaderPropTypes;

export const notesWordCountLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.notes.getWordCountsAggregates({filter}).then(r => r.data),
  NOTES_WORDCOUNT,
);

export const NotesWordCountLoader = ({filter, children}) => (
  <Loader
    dataId={NOTES_WORDCOUNT}
    filter={filter}
    load={notesWordCountLoader}
    subscriptions={['notes.timer', 'notes.changed']}
  >
    {children}
  </Loader>
);

NotesWordCountLoader.propTypes = loaderPropTypes;

// vim: set ts=2 sw=2 tw=80:
