/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Tag from 'gmp/models/tag';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';
import TagsTable from 'web/pages/tags/TagTable';

describe('TagsTable tests', () => {
  test('should render tags in table with sort headers', () => {
    const tags = [
      new Tag({
        id: '1',
        name: 'Tag 1',
        value: 'value1',
        active: YES_VALUE,
        resourceType: 'target',
        resourceCount: 3,
      }),
      new Tag({
        id: '2',
        name: 'Tag 2',
        value: 'value2',
        active: NO_VALUE,
        resourceType: 'task',
        resourceCount: 1,
      }),
    ];
    const {render} = rendererWith({capabilities: true});
    render(
      <TagsTable
        entities={tags}
        onTagCloneClick={testing.fn()}
        onTagDeleteClick={testing.fn()}
        onTagDisableClick={testing.fn()}
        onTagDownloadClick={testing.fn()}
        onTagEditClick={testing.fn()}
        onTagEnableClick={testing.fn()}
      />,
    );

    screen.getByTestId('entities-table');
    screen.getByText('Tag 1');
    screen.getByText('Tag 2');

    // Sort headers
    screen.getByTestId('table-header-sort-by-name');
    screen.getByTestId('table-header-sort-by-value');
    screen.getByTestId('table-header-sort-by-active');
  });

  test('should handle empty and undefined entities', () => {
    let {render} = rendererWith({capabilities: true});

    // Test with empty array
    render(
      <TagsTable
        entities={[]}
        onTagCloneClick={testing.fn()}
        onTagDeleteClick={testing.fn()}
        onTagDisableClick={testing.fn()}
        onTagDownloadClick={testing.fn()}
        onTagEditClick={testing.fn()}
        onTagEnableClick={testing.fn()}
      />,
    );
    screen.getByText('No tags available');
    expect(screen.queryByTestId('entities-table')).not.toBeInTheDocument();

    // Test with undefined entities
    ({render} = rendererWith({capabilities: true}));
    render(
      <TagsTable
        onTagCloneClick={testing.fn()}
        onTagDeleteClick={testing.fn()}
        onTagDisableClick={testing.fn()}
        onTagDownloadClick={testing.fn()}
        onTagEditClick={testing.fn()}
        onTagEnableClick={testing.fn()}
      />,
    );
    expect(screen.queryByTestId('entities-table')).not.toBeInTheDocument();
  });

  test('should call action handlers', () => {
    const tag = new Tag({
      id: '1',
      name: 'Tag 1',
      value: 'value1',
      active: YES_VALUE,
      resourceType: 'target',
      resourceCount: 3,
      userCapabilities: new EverythingCapabilities(),
    });
    const handleClone = testing.fn();
    const handleEdit = testing.fn();

    const {render} = rendererWith({capabilities: true});
    render(
      <TagsTable
        entities={[tag]}
        onTagCloneClick={handleClone}
        onTagDeleteClick={testing.fn()}
        onTagDisableClick={testing.fn()}
        onTagDownloadClick={testing.fn()}
        onTagEditClick={handleEdit}
        onTagEnableClick={testing.fn()}
      />,
    );

    fireEvent.click(screen.getByTitle('Edit Tag'));
    expect(handleEdit).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Clone Tag'));
    expect(handleClone).toHaveBeenCalled();
  });
});
