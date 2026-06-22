/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import NoteListPageToolBarIcons from 'web/pages/notes/NoteListPageToolBarIcons';

const createGmp = () => ({
  settings: {
    manualUrl: 'https://example.com/manual',
  },
});

describe('NoteListPageToolBarIcons tests', () => {
  test('should render ManualIcon', () => {
    const handleCreate = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(<NoteListPageToolBarIcons onNoteCreateClick={handleCreate} />);

    expect(screen.getByTitle('Help: Notes')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Help Icon'})).toHaveAttribute(
      'href',
      'https://example.com/manual/en/reports.html#managing-notes',
    );
  });

  test('should allow to create new note when the user has create capabilities', () => {
    const handleCreate = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(<NoteListPageToolBarIcons onNoteCreateClick={handleCreate} />);

    const newIcon = screen.getByTitle('New Note');
    expect(newIcon).toBeInTheDocument();

    newIcon.click();
    expect(handleCreate).toHaveBeenCalledTimes(1);
  });

  test('should not render the NewIcon when the user lacks create capabilities', () => {
    const handleCreate = testing.fn();
    const {render} = rendererWith({capabilities: false, gmp: createGmp()});
    render(<NoteListPageToolBarIcons onNoteCreateClick={handleCreate} />);

    expect(screen.queryByTitle('New Note')).not.toBeInTheDocument();
  });
});
