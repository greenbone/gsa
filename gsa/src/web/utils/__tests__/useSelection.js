/* Copyright (C) 2020-2021 Greenbone Networks GmbH
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

/* eslint-disable react/prop-types */

import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import {rendererWith, screen, fireEvent} from '../testing';

import useSelection from '../useSelection';
import SelectionType from '../selectiontype';

const TestComponent = ({entities, selectionType: initialSelectionType}) => {
  const {
    selected,
    selectionType,
    select,
    deselect,
    changeSelectionType,
  } = useSelection(initialSelectionType);
  return (
    <div>
      <div data-testid="selection-type">{selectionType}</div>
      <button
        data-testid="user-selection"
        onClick={() => changeSelectionType(SelectionType.SELECTION_USER)}
      />
      <button
        data-testid="page-content-selection"
        onClick={() =>
          changeSelectionType(SelectionType.SELECTION_PAGE_CONTENTS)
        }
      />
      <button
        data-testid="filter-selection"
        onClick={() => changeSelectionType(SelectionType.SELECTION_FILTER)}
      />

      {entities.map(entity => (
        <div
          key={entity.id}
          data-testid={entity.id}
          onClick={() => select(entity.id)}
        >
          {entity.name}
        </div>
      ))}

      {isDefined(selected) &&
        selected.map(id => (
          <div key={id} data-testid="selected" onClick={() => deselect(id)}>
            {id}
          </div>
        ))}
    </div>
  );
};

describe('useSelection tests', () => {
  test('should use page content selection by default', () => {
    const {render} = rendererWith();

    render(<TestComponent entities={[]} />);

    expect(screen.getByTestId('selection-type')).toHaveTextContent(
      SelectionType.SELECTION_PAGE_CONTENTS,
    );
  });

  test('should only allow to select value in user selection mode', () => {
    const entities = [
      {
        id: 1,
        name: 'e1',
      },
      {
        id: 2,
        name: 'e2',
      },
      {
        id: 3,
        name: 'e3',
      },
    ];
    const {render} = rendererWith();

    render(<TestComponent entities={entities} />);

    expect(screen.getByTestId('selection-type')).toHaveTextContent(
      SelectionType.SELECTION_PAGE_CONTENTS,
    );

    expect(screen.queryAllByTestId('selected')).toHaveLength(0);

    const entity = screen.getByTestId('1');
    fireEvent.click(entity);

    expect(screen.queryAllByTestId('selected')).toHaveLength(0);
  });

  test('should allow to change the selection type', () => {
    const entities = [
      {
        id: 1,
        name: 'e1',
      },
      {
        id: 2,
        name: 'e2',
      },
      {
        id: 3,
        name: 'e3',
      },
    ];
    const {render} = rendererWith();

    render(<TestComponent entities={entities} />);

    expect(screen.queryAllByTestId('selected')).toHaveLength(0);

    const entity = screen.getByTestId('1');
    fireEvent.click(entity);

    expect(screen.queryAllByTestId('selected')).toHaveLength(0);

    const button = screen.getByTestId('user-selection');

    fireEvent.click(button);

    fireEvent.click(entity);
    expect(screen.queryAllByTestId('selected')).toHaveLength(1);

    const [selectedDiv] = screen.queryAllByTestId('selected');
    expect(selectedDiv).toHaveTextContent('1');

    fireEvent.click(selectedDiv);
    expect(screen.queryAllByTestId('selected')).toHaveLength(0);
  });

  test('should allow to select a value for user selection type', () => {
    const entities = [
      {
        id: 1,
        name: 'e1',
      },
      {
        id: 2,
        name: 'e2',
      },
      {
        id: 3,
        name: 'e3',
      },
    ];
    const {render} = rendererWith();

    render(
      <TestComponent
        entities={entities}
        selectionType={SelectionType.SELECTION_USER}
      />,
    );

    expect(screen.getByTestId('selection-type')).toHaveTextContent(
      SelectionType.SELECTION_USER,
    );

    expect(screen.queryAllByTestId('selected')).toHaveLength(0);

    const entity = screen.getByTestId('1');
    fireEvent.click(entity);

    expect(screen.queryAllByTestId('selected')).toHaveLength(1);

    const [selectedDiv] = screen.queryAllByTestId('selected');
    expect(selectedDiv).toHaveTextContent('1');

    fireEvent.click(selectedDiv);
    expect(screen.queryAllByTestId('selected')).toHaveLength(0);
  });

  test('should allow to deselect a value for user selection type', () => {
    const entities = [
      {
        id: 1,
        name: 'e1',
      },
      {
        id: 2,
        name: 'e2',
      },
      {
        id: 3,
        name: 'e3',
      },
    ];
    const {render} = rendererWith();

    render(
      <TestComponent
        entities={entities}
        selectionType={SelectionType.SELECTION_USER}
      />,
    );

    expect(screen.getByTestId('selection-type')).toHaveTextContent(
      SelectionType.SELECTION_USER,
    );

    expect(screen.queryAllByTestId('selected')).toHaveLength(0);

    const entity = screen.getByTestId('1');
    fireEvent.click(entity);

    expect(screen.queryAllByTestId('selected')).toHaveLength(1);
    expect(screen.queryAllByTestId('selected')[0]).toHaveTextContent('1');
  });

  test('should reset selected values when the selection type changes', () => {
    const entities = [
      {
        id: 1,
        name: 'e1',
      },
      {
        id: 2,
        name: 'e2',
      },
      {
        id: 3,
        name: 'e3',
      },
    ];
    const {render} = rendererWith();

    render(
      <TestComponent
        entities={entities}
        selectionType={SelectionType.SELECTION_USER}
      />,
    );

    expect(screen.getByTestId('selection-type')).toHaveTextContent(
      SelectionType.SELECTION_USER,
    );

    expect(screen.queryAllByTestId('selected')).toHaveLength(0);

    const entity = screen.getByTestId('1');
    fireEvent.click(entity);

    expect(screen.queryAllByTestId('selected')).toHaveLength(1);

    const [selectedDiv] = screen.queryAllByTestId('selected');
    expect(selectedDiv).toHaveTextContent('1');

    const button = screen.getByTestId('filter-selection');
    fireEvent.click(button);

    expect(screen.getByTestId('selection-type')).toHaveTextContent(
      SelectionType.SELECTION_FILTER,
    );

    expect(screen.queryAllByTestId('selected')).toHaveLength(0);
  });
});
