/* Copyright (C) 2020-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import {isDefined} from 'gmp/utils/identity';

import {rendererWith, fireEvent, wait, screen} from 'web/utils/testing';

import {useLazyGetNotes} from '../notes';

import {createGetNotesQueryMock} from '../__mocks__/notes';

const GetLazyNotesComponent = () => {
  const [getNotes, {counts, loading, notes}] = useLazyGetNotes();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getNotes()} />
      {isDefined(counts) ? (
        <div data-testid="counts">
          <span data-testid="total">{counts.all}</span>
          <span data-testid="filtered">{counts.filtered}</span>
          <span data-testid="first">{counts.first}</span>
          <span data-testid="limit">{counts.rows}</span>
          <span data-testid="length">{counts.length}</span>
        </div>
      ) : (
        <div data-testid="no-counts" />
      )}
      {isDefined(notes) ? (
        notes.map(note => {
          return (
            <div key={note.id} data-testid="note">
              {note.id}
            </div>
          );
        })
      ) : (
        <div data-testid="no-notes" />
      )}
    </div>
  );
};

describe('useLazyGetNotes tests', () => {
  test('should query notes after user interaction', async () => {
    const [mock, resultFunc] = createGetNotesQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<GetLazyNotesComponent />);

    let noteElements = screen.queryAllByTestId('note');
    expect(noteElements).toHaveLength(0);

    expect(screen.queryByTestId('no-notes')).toBeInTheDocument();
    expect(screen.queryByTestId('no-counts')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    noteElements = screen.getAllByTestId('note');
    expect(noteElements).toHaveLength(2);

    expect(noteElements[0]).toHaveTextContent('123');
    expect(noteElements[1]).toHaveTextContent('456');

    expect(screen.queryByTestId('no-notes')).not.toBeInTheDocument();

    expect(screen.getByTestId('total')).toHaveTextContent(2);
    expect(screen.getByTestId('filtered')).toHaveTextContent(2);
    expect(screen.getByTestId('first')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(2);
  });
});
