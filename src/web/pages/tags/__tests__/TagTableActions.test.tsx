/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWithTableRow, screen} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Tag from 'gmp/models/tag';
import {YES_VALUE} from 'gmp/parser';
import {createSession} from 'gmp/testing';
import TagTableActions from 'web/pages/tags/TagTableActions';

const createGmp = () => ({session: createSession()});

const createTag = () =>
  new Tag({
    id: 'tag-1',
    name: 'Test Tag',
    value: 'test-value',
    active: YES_VALUE,
    userCapabilities: new EverythingCapabilities(),
  });

describe('TagTableActions tests', () => {
  test('should render actions and call click handlers', () => {
    const tag = createTag();
    const handlers = {
      clone: testing.fn(),
      delete: testing.fn(),
      disable: testing.fn(),
      download: testing.fn(),
      edit: testing.fn(),
    };
    const {render} = rendererWithTableRow({
      capabilities: true,
      gmp: createGmp(),
    });

    render(
      <TagTableActions
        entity={tag}
        onTagCloneClick={handlers.clone}
        onTagDeleteClick={handlers.delete}
        onTagDisableClick={handlers.disable}
        onTagDownloadClick={handlers.download}
        onTagEditClick={handlers.edit}
      />,
    );

    fireEvent.click(screen.getByTitle('Disable Tag'));
    fireEvent.click(screen.getByTitle('Move Tag to trashcan'));
    fireEvent.click(screen.getByTitle('Edit Tag'));
    fireEvent.click(screen.getByTitle('Clone Tag'));
    fireEvent.click(screen.getByTitle('Export Tag'));

    expect(handlers.disable).toHaveBeenCalledWith(tag);
    expect(handlers.delete).toHaveBeenCalledWith(tag);
    expect(handlers.edit).toHaveBeenCalledWith(tag);
    expect(handlers.clone).toHaveBeenCalledWith(tag);
    expect(handlers.download).toHaveBeenCalledWith(tag);
  });

  test('should hide the status action when the user cannot edit tags', () => {
    const {render} = rendererWithTableRow({
      capabilities: false,
      gmp: createGmp(),
    });

    render(<TagTableActions entity={createTag()} />);

    expect(screen.queryByTitle('Disable Tag')).not.toBeInTheDocument();
    expect(
      screen.getByTitle('Permission to edit Tag denied'),
    ).toBeInTheDocument();
  });
});
