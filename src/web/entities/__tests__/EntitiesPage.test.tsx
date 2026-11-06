/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter, {type FilterType} from 'gmp/models/filter';
import QueryFilter from 'gmp/models/filter/query-filter';
import Task from 'gmp/models/task';
import {createSession} from 'gmp/testing';
import EntitiesPage, {type EntitiesPageProps} from 'web/entities/EntitiesPage';

type PowerFilterProps = {
  onEditClick?: () => void;
  onError?: (error: Error) => void;
  onRemoveClick?: () => void;
  onResetClick?: () => void;
  onUpdate?: (filter: QueryFilter) => void;
};

type FilterDialogProps = {
  onClose: () => void;
  onFilterChanged: (filter: QueryFilter) => void;
  onFilterCreated: (filter: Filter) => void;
};

type GmpOverrides = {
  getFilters?: ReturnType<typeof testing.fn>;
};

type TableProps = {
  entities: Task[];
  entitiesCounts?: CollectionCounts;
  filter?: FilterType;
};

type SectionProps = {
  children?: React.ReactNode;
  extra?: React.ReactNode;
  title: string;
};

const filter = QueryFilter.fromString('name~task');
const task = new Task({id: 'task-1', name: 'Task 1'});

const createGmp = ({
  getFilters = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      counts: new CollectionCounts(),
      filter: QueryFilter.fromString(),
    },
  }),
}: GmpOverrides = {}) => ({
  session: createSession({token: 'test-token'}),
  settings: {},
  filters: {get: getFilters},
});

const createProps = (): EntitiesPageProps<Task> => ({
  createFilterType: 'task',
  dashboard: () => <div data-testid="dashboard">Dashboard</div>,
  dashboardControls: () => <button>Dashboard controls</button>,
  entities: [task],
  entitiesCounts: new CollectionCounts({all: 4, filtered: 1}),
  filter,
  filterEditDialog: FilterDialog,
  filtersFilter: filter,
  isLoading: false,
  powerfilter: PowerFilter,
  sectionIcon: <span data-testid="section-icon" />,
  table: Table,
  title: 'Tasks',
  toolBarIcons: <span data-testid="toolbar-icons">Toolbar icons</span>,
  onError: testing.fn(),
  onFilterChanged: testing.fn(),
  onFilterCreated: testing.fn(),
  onFilterRemoved: testing.fn(),
  onFilterReset: testing.fn(),
});

const renderPage = (
  props: EntitiesPageProps<Task> = createProps(),
  gmp = createGmp(),
) => {
  const {render, ...renderer} = rendererWith({
    capabilities: true,
    gmp,
    router: false,
    store: true,
  });

  return {...render(<EntitiesPage {...props} />), ...renderer};
};

const PowerFilter = ({
  onEditClick,
  onRemoveClick,
  onResetClick,
  onUpdate,
}: PowerFilterProps) => {
  return (
    <div data-testid="power-filter">
      <button onClick={onEditClick}>Edit filter</button>
      <button onClick={onRemoveClick}>Remove filter</button>
      <button onClick={onResetClick}>Reset filter</button>
      <button onClick={() => onUpdate?.(filter)}>Update filter</button>
    </div>
  );
};

const FilterDialog = ({
  onClose,
  onFilterChanged,
  onFilterCreated,
}: FilterDialogProps) => {
  return (
    <div role="dialog">
      <button onClick={onClose}>Close filter dialog</button>
      <button onClick={() => onFilterChanged(filter)}>Change filter</button>
      <button onClick={() => onFilterCreated(new Filter({id: 'new-filter'}))}>
        Create filter
      </button>
    </div>
  );
};

const Table = ({entities, entitiesCounts, filter: tableFilter}: TableProps) => {
  return (
    <div data-testid="table">
      {entities.at(0)?.name} {entitiesCounts?.filtered}/{entitiesCounts?.all}{' '}
      {tableFilter?.toFilterString()}
    </div>
  );
};

const CustomSection = ({children, extra, title}: SectionProps) => {
  return (
    <section data-testid="custom-section">
      <h2>{title}</h2>
      {extra}
      {children}
    </section>
  );
};

const ToolbarIcons = () => {
  return <span data-testid="toolbar-icons-component">Toolbar icons</span>;
};

describe('EntitiesPage', () => {
  test('renders the toolbar, dashboard, section, table and filter controls', () => {
    const props = createProps();
    const getFilters = testing.fn().mockResolvedValue({
      data: [],
      meta: {
        counts: new CollectionCounts(),
        filter: QueryFilter.fromString(),
      },
    });
    renderPage(props, createGmp({getFilters}));

    expect(screen.getByTestId('toolbar-icons')).toBeInTheDocument();
    expect(screen.getByTestId('power-filter')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    expect(screen.getByText('Dashboard controls')).toBeInTheDocument();
    expect(screen.getByText('Tasks 1 of 4')).toBeInTheDocument();
    expect(screen.getByTestId('section-icon')).toBeInTheDocument();
    expect(screen.getByTestId('table')).toHaveTextContent('Task 1');
    expect(getFilters).toHaveBeenCalledTimes(1);
  });

  test('passes table props and invokes power-filter callbacks', () => {
    const props = createProps();
    renderPage(props);

    fireEvent.click(screen.getByText('Remove filter'));
    fireEvent.click(screen.getByText('Reset filter'));
    fireEvent.click(screen.getByText('Update filter'));

    expect(props.onFilterRemoved).toHaveBeenCalledTimes(1);
    expect(props.onFilterReset).toHaveBeenCalledTimes(1);
    expect(props.onFilterChanged).toHaveBeenCalledWith(filter);
  });

  test('opens and closes the filter dialog and handles created filters', async () => {
    const props = createProps();
    const getFilters = testing.fn().mockResolvedValue({
      data: [],
      meta: {
        counts: new CollectionCounts(),
        filter: QueryFilter.fromString(),
      },
    });
    renderPage(props, createGmp({getFilters}));
    await waitFor(() => expect(getFilters).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Edit filter'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Change filter'));
    expect(props.onFilterChanged).toHaveBeenCalledWith(filter);

    fireEvent.click(screen.getByText('Create filter'));
    expect(props.onFilterCreated).toHaveBeenCalledWith(
      expect.objectContaining({id: 'new-filter'}),
    );
    await waitFor(() => expect(getFilters).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getByText('Close filter dialog'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('renders loading and error states', () => {
    const loadingProps = {
      ...createProps(),
      entities: undefined,
      isLoading: true,
    };
    const result = renderPage(loadingProps);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.queryByTestId('table')).not.toBeInTheDocument();

    const error = new Error('Unable to load tasks');
    result.rerender(
      <EntitiesPage
        {...loadingProps}
        entities={[task]}
        entitiesError={error}
        isLoading={false}
      />,
    );
    expect(screen.getByTestId('error-message')).toHaveTextContent(
      'Unable to load tasks',
    );
  });

  test('renders a title without counts and supports node-valued section content', () => {
    const props = {
      ...createProps(),
      dashboard: <div data-testid="dashboard-node">Dashboard node</div>,
      dashboardControls: <button type="button">Dashboard controls node</button>,
      entitiesCounts: undefined,
      section: CustomSection,
    };
    renderPage(props);

    expect(screen.getByTestId('custom-section')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-node')).toBeInTheDocument();
    expect(screen.getByText('Dashboard controls node')).toBeInTheDocument();
  });

  test('handles missing entities or tables without rendering table content', () => {
    const props = createProps();
    const missingEntitiesProps = {
      ...props,
      entities: undefined,
      isLoading: false,
    };
    const missingTableProps = {
      ...props,
      table: undefined as never,
    };

    const result = renderPage(missingEntitiesProps);
    expect(screen.queryByTestId('table')).not.toBeInTheDocument();

    result.rerender(<EntitiesPage {...missingTableProps} />);
    expect(screen.queryByTestId('table')).not.toBeInTheDocument();
  });

  test('passes no edit handler when the filter dialog is unavailable', () => {
    const props = {
      ...createProps(),
      filterEditDialog: undefined as never,
    };

    renderPage(props);
    fireEvent.click(screen.getByText('Edit filter'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('renders component-valued toolbar icons and element-valued tables', () => {
    const props = {
      ...createProps(),
      table: <div data-testid="element-table">Element table</div>,
      toolBarIcons: ToolbarIcons,
    };

    renderPage(props);

    expect(screen.getByTestId('toolbar-icons-component')).toBeInTheDocument();
    expect(screen.getByTestId('element-table')).toBeInTheDocument();
  });

  test('supports omitted optional components and an element table', () => {
    const props = createProps();
    const optionalProps = {
      ...props,
      dashboard: undefined,
      dashboardControls: undefined,
      filterEditDialog: undefined as never,
      powerfilter: null as never,
      section: false as const,
      table: <div data-testid="element-table">Element table</div>,
      toolBarIcons: undefined,
    };

    renderPage(optionalProps);

    expect(screen.queryByTestId('power-filter')).not.toBeInTheDocument();
    expect(screen.queryByTestId('element-table')).not.toBeInTheDocument();
    expect(screen.queryByTestId('toolbar-icons')).not.toBeInTheDocument();
  });

  test('does not load filters when no filters filter is supplied', () => {
    const props = createProps();
    const getFilters = testing.fn().mockResolvedValue({
      data: [],
      meta: {
        counts: new CollectionCounts(),
        filter: QueryFilter.fromString(),
      },
    });
    const gmp = createGmp({getFilters});
    const {render} = rendererWith({
      capabilities: true,
      gmp,
      store: true,
      router: false,
    });

    render(<EntitiesPage {...props} filtersFilter={undefined as never} />);

    expect(getFilters).not.toHaveBeenCalled();
  });

  test('maps loaded filters and loading state through the connected component', async () => {
    const props = createProps();
    const getFilters = testing.fn().mockResolvedValue({
      data: [new Filter({id: 'loaded-filter'})],
      meta: {
        counts: new CollectionCounts({all: 1, filtered: 1}),
        filter: QueryFilter.fromString(),
      },
    });
    const gmp = createGmp({getFilters});
    const {render} = rendererWith({
      capabilities: true,
      gmp,
      store: true,
      router: false,
    });

    render(<EntitiesPage {...props} />);

    await waitFor(() => expect(getFilters).toHaveBeenCalled());
    expect(screen.getByTestId('power-filter')).toBeInTheDocument();
  });
});
