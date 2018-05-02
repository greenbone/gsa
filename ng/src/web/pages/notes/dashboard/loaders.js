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

import Loader, {
  loadFunc,
  loaderPropTypes,
} from '../../../components/dashboard2/data/loader';

export const NOTES_ACTIVE_DAYS = 'notes-active-days';

export const notesActiveDaysLoader = loadFunc(
  ({gmp, filter}) => gmp.notes.getActiveDaysAggregates({filter})
    .then(r => r.data),
  NOTES_ACTIVE_DAYS);

export const NotesActiveDaysLoader = ({
  filter,
  children,
}) => (
  <Loader
    dataId={NOTES_ACTIVE_DAYS}
    filter={filter}
    load={notesActiveDaysLoader}
    subscriptions={[
      'notes.timer',
      'notes.changed',
    ]}
  >
    {children}
  </Loader>
);

NotesActiveDaysLoader.propTypes = loaderPropTypes;

export const NOTES_WORDCOUNT = 'notes-wordcount';

export const notesWordCountLoader = loadFunc(
  ({gmp, filter}) => gmp.notes.getWordCountsAggregates({filter})
    .then(r => r.data),
  NOTES_WORDCOUNT);

export const NotesWordCountLoader = ({
  filter,
  children,
}) => (
  <Loader
    dataId={NOTES_WORDCOUNT}
    filter={filter}
    load={notesWordCountLoader}
    subscriptions={[
      'results.timer',
      'results.changed',
    ]}
  >
    {children}
  </Loader>
);

NotesWordCountLoader.propTypes = loaderPropTypes;

// vim: set ts=2 sw=2 tw=80:
