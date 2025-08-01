/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, screen} from 'web/testing';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Filter from 'gmp/models/filter';
import Task from 'gmp/models/task';
import withEntitiesFooter, {
  WithEntitiesFooterComponentProps,
} from 'web/entities/withEntitiesFooter';

describe('withEntitiesFooter tests', () => {
  test('should render the wrapped component', () => {
    const MockComponent = () => <div>Mock Component</div>;
    const WrappedComponent = withEntitiesFooter()(MockComponent);

    render(<WrappedComponent />);

    expect(screen.getByText('Mock Component')).toBeInTheDocument();
  });

  test('should pass the correct props to the wrapped component', () => {
    const MockComponent = testing.fn(() => <div>Mock Component</div>);
    const WrappedComponent = withEntitiesFooter<Task>()(MockComponent);

    const mockProps = {
      entities: [new Task({id: '1'}), new Task({id: '2'})],
      entitiesCounts: new CollectionCounts({all: 2, filtered: 2, length: 2}),
      filter: new Filter(),
      onDeleteBulk: testing.fn(),
      onDownloadBulk: testing.fn(),
      onTagsBulk: testing.fn(),
    };

    render(<WrappedComponent {...mockProps} />);

    expect(MockComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        entities: mockProps.entities,
        entitiesCounts: mockProps.entitiesCounts,
        filter: mockProps.filter,
        onDeleteClick: mockProps.onDeleteBulk,
        onDownloadClick: mockProps.onDownloadBulk,
        onTagsClick: mockProps.onTagsBulk,
        onTrashClick: mockProps.onDeleteBulk,
      }),
      {},
    );
  });

  test('should merge options with props and pass them to the wrapped component', () => {
    interface MockProps extends WithEntitiesFooterComponentProps<Task> {
      foo?: string;
    }
    const options = {
      foo: 'bar',
    } as Partial<MockProps>;
    const MockComponent = testing.fn(() => <div>Mock Component</div>);
    const WrappedComponent = withEntitiesFooter(options)(MockComponent);

    const mockProps = {
      entities: [new Task({id: '1'})],
      onDeleteBulk: testing.fn(),
    };

    render(<WrappedComponent {...mockProps} />);

    expect(MockComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        foo: options.foo,
        entities: mockProps.entities,
        onDeleteClick: mockProps.onDeleteBulk,
      }),
      {},
    );
  });

  test('should override options with props', () => {
    interface MockProps extends WithEntitiesFooterComponentProps<Task> {
      foo?: string;
    }
    const options = {
      foo: 'bar',
    } as Partial<MockProps>;
    const MockComponent = testing.fn(() => <div>Mock Component</div>);
    const WrappedComponent = withEntitiesFooter(options)(MockComponent);

    const mockProps = {
      entities: [new Task({id: '1'})],
      foo: 'baz', // This should override the option
      onDeleteBulk: testing.fn(),
    };

    render(<WrappedComponent {...mockProps} />);

    expect(MockComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        foo: mockProps.foo,
        entities: mockProps.entities,
        onDeleteClick: mockProps.onDeleteBulk,
      }),
      {},
    );
  });
});
