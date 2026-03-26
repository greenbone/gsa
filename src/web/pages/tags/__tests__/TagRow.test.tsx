/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWithTableBody, fireEvent, screen} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import dayjs from 'gmp/models/date';
import Tag from 'gmp/models/tag';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';
import {Row} from 'web/pages/tags/TagTable';

const createTag = (id = 'tag-1') =>
  new Tag({
    id,
    name: 'Test Tag',
    value: 'test-value',
    active: YES_VALUE,
    resourceType: 'target',
    resourceCount: 5,
    modificationTime: dayjs('2025-01-01T00:00:00Z'),
    userCapabilities: new EverythingCapabilities(),
  });

describe('TagRow tests', () => {
  test('should render tag in table row with action buttons', () => {
    const tag = createTag();
    const {render} = rendererWithTableBody({capabilities: true});
    render(
      <Row
        entity={tag}
        onTagCloneClick={testing.fn()}
        onTagDeleteClick={testing.fn()}
        onTagDisableClick={testing.fn()}
        onTagDownloadClick={testing.fn()}
        onTagEditClick={testing.fn()}
        onTagEnableClick={testing.fn()}
        onToggleDetailsClick={testing.fn()}
      />,
    );

    // Content
    screen.getByText('Test Tag');
    screen.getByText('test-value');
    screen.getByText('Yes');
    screen.getByText('Target');
    screen.getByText('5');

    // Action buttons
    screen.getByTitle('Move Tag to trashcan');
    screen.getByTitle('Edit Tag');
    screen.getByTitle('Clone Tag');
    screen.getByTitle('Export Tag');
  });

  test('should render disable button when tag is active', () => {
    const activeTag = createTag();
    const {render} = rendererWithTableBody({capabilities: true});
    render(
      <Row
        entity={activeTag}
        onTagCloneClick={testing.fn()}
        onTagDeleteClick={testing.fn()}
        onTagDisableClick={testing.fn()}
        onTagDownloadClick={testing.fn()}
        onTagEditClick={testing.fn()}
        onTagEnableClick={testing.fn()}
        onToggleDetailsClick={testing.fn()}
      />,
    );

    screen.getByTitle('Disable Tag');
    expect(screen.queryByTitle('Enable Tag')).not.toBeInTheDocument();
  });

  test('should render enable button when tag is disabled', () => {
    const disabledTag = new Tag({
      id: 'tag-1',
      name: 'Test Tag',
      value: 'test-value',
      active: NO_VALUE,
      resourceType: 'target',
      resourceCount: 5,
      userCapabilities: new EverythingCapabilities(),
    });
    const {render} = rendererWithTableBody({capabilities: true});
    render(
      <Row
        entity={disabledTag}
        onTagCloneClick={testing.fn()}
        onTagDeleteClick={testing.fn()}
        onTagDisableClick={testing.fn()}
        onTagDownloadClick={testing.fn()}
        onTagEditClick={testing.fn()}
        onTagEnableClick={testing.fn()}
        onToggleDetailsClick={testing.fn()}
      />,
    );

    screen.getByTitle('Enable Tag');
    expect(screen.queryByTitle('Disable Tag')).not.toBeInTheDocument();
  });

  test('should call action handlers', () => {
    const tag = createTag();
    const handleEdit = testing.fn();
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEnable = testing.fn();
    const handleDisable = testing.fn();

    const {render} = rendererWithTableBody({capabilities: true});
    render(
      <Row
        entity={tag}
        onTagCloneClick={handleClone}
        onTagDeleteClick={handleDelete}
        onTagDisableClick={handleDisable}
        onTagDownloadClick={handleDownload}
        onTagEditClick={handleEdit}
        onTagEnableClick={handleEnable}
        onToggleDetailsClick={testing.fn()}
      />,
    );

    fireEvent.click(screen.getByTitle('Edit Tag'));
    expect(handleEdit).toHaveBeenCalledWith(tag);

    fireEvent.click(screen.getByTitle('Clone Tag'));
    expect(handleClone).toHaveBeenCalledWith(tag);

    fireEvent.click(screen.getByTitle('Move Tag to trashcan'));
    expect(handleDelete).toHaveBeenCalledWith(tag);

    fireEvent.click(screen.getByTitle('Export Tag'));
    expect(handleDownload).toHaveBeenCalledWith(tag);

    fireEvent.click(screen.getByTitle('Disable Tag'));
    expect(handleDisable).toHaveBeenCalledWith(tag);
  });

  test('should not render disable button if user cannot edit', () => {
    const tag = createTag();
    const {render} = rendererWithTableBody({capabilities: false});
    render(
      <Row
        entity={tag}
        onTagCloneClick={testing.fn()}
        onTagDeleteClick={testing.fn()}
        onTagDisableClick={testing.fn()}
        onTagDownloadClick={testing.fn()}
        onTagEditClick={testing.fn()}
        onTagEnableClick={testing.fn()}
        onToggleDetailsClick={testing.fn()}
      />,
    );

    expect(screen.queryByTitle('Disable Tag')).not.toBeInTheDocument();
  });
});
