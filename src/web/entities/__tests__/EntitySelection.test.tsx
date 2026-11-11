/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, render, fireEvent} from 'web/testing';
import EntitySelection from 'web/entities/EntitySelection';

describe('EntitySelection', () => {
  test('should allow to select and deselect an entity', async () => {
    const entity = {
      id: 'entity-1',
      name: 'Test Entity',
    };
    const onSelected = testing.fn();
    const onDeselected = testing.fn();
    render(
      <EntitySelection
        entity={entity}
        onDeselected={onDeselected}
        onSelected={onSelected}
      />,
    );
    const selection = screen.getByTestId('entity-selection-entity-1');
    fireEvent.click(selection);
    expect(onSelected).toHaveBeenCalledWith(entity);

    fireEvent.click(selection);
    expect(onDeselected).toHaveBeenCalledWith(entity);
  });
});

test('reflects controlled selection, indeterminate and disabled state without retaining a local selection', () => {
  const entity = {id: 'controlled'};
  const onSelected = testing.fn();
  const onDeselected = testing.fn();
  const {rerender} = render(
    <EntitySelection
      aria-label="Select controlled"
      entity={entity}
      selected={false}
      onDeselected={onDeselected}
      onSelected={onSelected}
    />,
  );
  const checkbox = screen.getByRole('checkbox', {name: 'Select controlled'});
  fireEvent.click(checkbox);
  expect(onSelected).toHaveBeenCalledWith(entity);
  expect(checkbox).not.toBeChecked();
  rerender(
    <EntitySelection selected entity={entity} onDeselected={onDeselected} />,
  );
  expect(checkbox).toBeChecked();
  fireEvent.click(checkbox);
  expect(onDeselected).toHaveBeenCalledWith(entity);
  rerender(
    <EntitySelection disabled indeterminate entity={entity} selected={false} />,
  );
  expect(checkbox).toBeDisabled();
  expect(checkbox).toBePartiallyChecked();
});
