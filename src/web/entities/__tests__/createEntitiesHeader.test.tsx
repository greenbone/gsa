/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWithTable, screen} from 'web/testing';
import TableHead from 'web/components/table/TableHead';
import createEntitiesHeader from 'web/entities/createEntitiesHeader';
import SelectionType from 'web/utils/SelectionType';

describe('createEntitiesHeader test', () => {
  test('should render with default actions column', () => {
    const TestComponent = createEntitiesHeader([
      {
        name: 'foo',
        displayName: 'Foo',
        width: '20%',
        align: 'center',
      },
    ]);

    const {render} = rendererWithTable();
    render(<TestComponent />);
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  test('should render with custom actions column', () => {
    const customActions = <TableHead title="Custom Actions" />;
    const TestComponent = createEntitiesHeader(
      [
        {
          name: 'foo',
          displayName: 'Foo',
        },
      ],
      customActions,
    );

    const {render} = rendererWithTable();
    render(<TestComponent />);
    expect(screen.getByText('Custom Actions')).toBeInTheDocument();
  });

  test('should render user selection action', () => {
    const customActions = <TableHead title="Custom Actions" />;
    const TestComponent = createEntitiesHeader(
      [
        {
          name: 'foo',
          displayName: 'Foo',
        },
      ],
      customActions,
    );

    const {render} = rendererWithTable();
    const {rerender} = render(
      <TestComponent selectionType={SelectionType.SELECTION_USER} />,
    );
    expect(screen.getByText('Actions')).toBeInTheDocument();
    rerender(<TestComponent selectionType={SelectionType.SELECTION_FILTER} />);
    expect(screen.queryByText('Actions')).not.toBeInTheDocument();
    expect(screen.getByText('Custom Actions')).toBeInTheDocument();
  });

  test('should render no action column', () => {
    const TestComponent = createEntitiesHeader(
      [
        {
          name: 'foo',
          displayName: 'Foo',
        },
      ],
      null,
    );

    const {render} = rendererWithTable();
    render(<TestComponent />);
    expect(screen.queryByText('Actions')).not.toBeInTheDocument();
  });
});
