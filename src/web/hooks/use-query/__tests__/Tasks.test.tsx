/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import Task from 'gmp/models/task';
import {createSession} from 'gmp/testing';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {useGetTasks} from 'web/hooks/use-query/tasks';

const filter = QueryFilter.fromString('id=task-1');
const task = Task.fromElement({_id: 'task-1', name: 'Task 1'});

const TestComponent = ({enabled = true}: {enabled?: boolean}) => {
  const {data} = useGetTasks({enabled, filter, staleTime: 30_000});

  if (!data) {
    return <div data-testid="no-data" />;
  }

  return <div data-testid="task">{data.entities[0]?.name}</div>;
};

const createGmp = () => ({
  session: createSession({token: 'test-token'}),
  settings: {severityRating: SEVERITY_RATING_CVSS_3},
  tasks: {
    get: testing.fn().mockResolvedValue({
      data: [task],
      meta: {
        filter,
        counts: new CollectionCounts({all: 1, filtered: 1, length: 1}),
      },
    }),
  },
});

describe('useGetTasks', () => {
  test('should fetch tasks with the provided filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('task')).toHaveTextContent('Task 1');
    });

    expect(gmp.tasks.get).toHaveBeenCalledWith({filter});
  });

  test('should not fetch when disabled', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    render(<TestComponent enabled={false} />);

    expect(screen.getByTestId('no-data')).toBeInTheDocument();
    expect(gmp.tasks.get).not.toHaveBeenCalled();
  });
});
