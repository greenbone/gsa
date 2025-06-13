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
