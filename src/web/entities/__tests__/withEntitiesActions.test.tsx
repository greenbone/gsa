/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWithTableRow, screen} from 'web/testing';
import Task from 'gmp/models/task';
import withEntitiesActions, {
  WithEntitiesActionsComponentProps,
} from 'web/entities/withEntitiesActions';
import SelectionType from 'web/utils/SelectionType';

describe('withEntitiesActions', () => {
  test('should render the wrapped component with EntitiesActions', () => {
    interface MockProps {
      someProp: string;
    }
    const MockComponent = testing.fn((props: MockProps) => (
      <div>Mock Component</div>
    ));
    const WrappedComponent = withEntitiesActions<
      Task,
      WithEntitiesActionsComponentProps<Task, MockProps>
    >(MockComponent);
    const entity = new Task({id: '1', name: 'Test Task'});
    const {render} = rendererWithTableRow();

    render(<WrappedComponent entity={entity} someProp="test" />);

    expect(MockComponent).toHaveBeenCalledWith({someProp: 'test', entity}, {});
    expect(screen.getByText('Mock Component')).toBeInTheDocument();
  });

  test("should render entity selection when selectionType is 'user'", () => {
    interface MockProps {
      someProp: string;
    }
    const MockComponent = testing.fn((props: MockProps) => (
      <div>Mock Component</div>
    ));
    const WrappedComponent = withEntitiesActions<
      Task,
      WithEntitiesActionsComponentProps<Task, MockProps>
    >(MockComponent);
    const entity = new Task({id: '1', name: 'Test Task'});
    const {render} = rendererWithTableRow();

    render(
      <WrappedComponent
        entity={entity}
        selectionType={SelectionType.SELECTION_USER}
        someProp="test"
      />,
    );

    expect(MockComponent).not.toHaveBeenCalled();
    expect(screen.queryByText('Mock Component')).not.toBeInTheDocument();
    expect(
      screen.getByTestId(`entity-selection-${entity.id}`),
    ).toBeInTheDocument();
  });
});
