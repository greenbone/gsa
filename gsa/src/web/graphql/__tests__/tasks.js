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

import {rendererWith, screen, wait, fireEvent} from 'web/utils/testing';

import {
  useCloneTask,
  useCreateContainerTask,
  useCreateTask,
  useDeleteTask,
  useDeleteTasksByIds,
  useGetTasks,
  useGetTask,
  useLazyGetTasks,
  useModifyTask,
  useStartTask,
  useStopTask,
  useResumeTask,
  useDeleteTasksByFilter,
  useExportTasksByIds,
  useExportTasksByFilter,
} from '../tasks';
import {
  createCloneTaskQueryMock,
  createCreateContainerTaskQueryMock,
  createCreateTaskQueryMock,
  createDeleteTaskQueryMock,
  createGetTasksQueryMock,
  createGetTaskQueryMock,
  createModifyTaskQueryMock,
  createStartTaskQueryMock,
  createStopTaskQueryMock,
  createResumeTaskQueryMock,
  createDeleteTasksByIdsQueryMock,
  createDeleteTasksByFilterQueryMock,
  createGetTaskQueryErrorMock,
  createExportTasksByFilterQueryMock,
  createExportTasksByIdsQueryMock,
} from '../__mocks__/tasks';
import {isDefined} from 'gmp/utils/identity';

const GetTasksComponent = () => {
  const {counts, loading, tasks} = useGetTasks();
  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <div data-testid="counts">
        <span data-testid="total">{counts.all}</span>
        <span data-testid="filtered">{counts.filtered}</span>
        <span data-testid="offset">{counts.first}</span>
        <span data-testid="limit">{counts.rows}</span>
        <span data-testid="length">{counts.length}</span>
      </div>
      {tasks.map(task => {
        return (
          <div key={task.id} data-testid="task">
            {task.name}
          </div>
        );
      })}
    </div>
  );
};

const GetLazyTasksComponent = () => {
  const [getTasks, {counts, loading, tasks}] = useLazyGetTasks();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getTasks()} />
      {isDefined(counts) ? (
        <div data-testid="counts">
          <span data-testid="total">{counts.all}</span>
          <span data-testid="filtered">{counts.filtered}</span>
          <span data-testid="offset">{counts.first}</span>
          <span data-testid="limit">{counts.rows}</span>
          <span data-testid="length">{counts.length}</span>
        </div>
      ) : (
        <div data-testid="no-counts" />
      )}
      {isDefined(tasks) ? (
        tasks.map(task => {
          return (
            <div key={task.id} data-testid="task">
              {task.name}
            </div>
          );
        })
      ) : (
        <div data-testid="no-task" />
      )}
    </div>
  );
};

describe('useGetTasks tests', () => {
  test('should query tasks', async () => {
    const [mock, resultFunc] = createGetTasksQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<GetTasksComponent />);

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const taskElements = screen.getAllByTestId('task');
    expect(taskElements).toHaveLength(1);

    expect(taskElements[0]).toHaveTextContent('foo');

    expect(screen.getByTestId('total')).toHaveTextContent(1);
    expect(screen.getByTestId('filtered')).toHaveTextContent(1);
    expect(screen.getByTestId('offset')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(1);
  });
});

describe('useLazyGetTasks tests', () => {
  test('should query tasks after user interaction', async () => {
    const [mock, resultFunc] = createGetTasksQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<GetLazyTasksComponent />);

    let taskElements = screen.queryAllByTestId('task');
    expect(taskElements).toHaveLength(0);

    let noTasks = screen.queryByTestId('no-task');
    expect(noTasks).toBeInTheDocument();
    const noCounts = screen.queryByTestId('no-counts');
    expect(noCounts).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    taskElements = screen.getAllByTestId('task');
    expect(taskElements).toHaveLength(1);

    expect(taskElements[0]).toHaveTextContent('foo');

    noTasks = screen.queryByTestId('no-task');
    expect(noTasks).not.toBeInTheDocument();

    expect(screen.getByTestId('total')).toHaveTextContent(1);
    expect(screen.getByTestId('filtered')).toHaveTextContent(1);
    expect(screen.getByTestId('offset')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(1);
  });
});

const DeleteTaskComponent = () => {
  const [deleteTask] = useDeleteTask();
  return <button data-testid="delete" onClick={() => deleteTask('foo')} />;
};

describe('useDeleteTask tests', () => {
  test('should delete a task after user interaction', async () => {
    const [mock, resultFunc] = createDeleteTaskQueryMock('foo');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<DeleteTaskComponent />);

    const button = screen.getByTestId('delete');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const DeleteTasksByIdsComponent = () => {
  const [deleteTasksByIds] = useDeleteTasksByIds();
  return (
    <button
      data-testid="bulk-delete"
      onClick={() => deleteTasksByIds(['foo', 'bar'])}
    />
  );
};

describe('useDeleteTasksByIds tests', () => {
  test('should delete a list of tasks after user interaction', async () => {
    const [mock, resultFunc] = createDeleteTasksByIdsQueryMock(['foo', 'bar']);
    const {render} = rendererWith({queryMocks: [mock]});

    render(<DeleteTasksByIdsComponent />);
    const button = screen.getByTestId('bulk-delete');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const DeleteTasksByFilterComponent = () => {
  const [deleteTasksByFilter] = useDeleteTasksByFilter();
  return (
    <button
      data-testid="filter-delete"
      onClick={() => deleteTasksByFilter('foo')}
    />
  );
};

describe('useDeleteTasksByFilter tests', () => {
  test('should delete a list of tasks by filter string after user interaction', async () => {
    const [mock, resultFunc] = createDeleteTasksByFilterQueryMock('foo');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<DeleteTasksByFilterComponent />);
    const button = screen.getByTestId('filter-delete');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const ExportTasksByIdsComponent = () => {
  const exportTasksByIds = useExportTasksByIds();
  return (
    <button
      data-testid="bulk-export"
      onClick={() => exportTasksByIds(['foo'])}
    />
  );
};

describe('useExportTasksByIds tests', () => {
  test('should export a list of tasks after user interaction', async () => {
    const [mock, resultFunc] = createExportTasksByIdsQueryMock(['foo']);
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ExportTasksByIdsComponent />);
    const button = screen.getByTestId('bulk-export');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const ExportTasksByFilterComponent = () => {
  const exportTasksByFilter = useExportTasksByFilter();
  return (
    <button
      data-testid="filter-export"
      onClick={() => exportTasksByFilter('foo')}
    />
  );
};

describe('useExportTasksByFilter tests', () => {
  test('should export a list of tasks by filter string after user interaction', async () => {
    const [mock, resultFunc] = createExportTasksByFilterQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ExportTasksByFilterComponent />);
    const button = screen.getByTestId('filter-export');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const CloneTaskComponent = () => {
  const [cloneTask, {id: taskId}] = useCloneTask();
  return (
    <div>
      {taskId && <span data-testid="cloned-task">{taskId}</span>}
      <button data-testid="clone" onClick={() => cloneTask('foo')} />
    </div>
  );
};

describe('useCloneTask tests', () => {
  test('should clone a task after user interaction', async () => {
    const [mock, resultFunc] = createCloneTaskQueryMock('foo', 'foo2');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<CloneTaskComponent />);

    const button = screen.getByTestId('clone');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.getByTestId('cloned-task')).toHaveTextContent('foo2');
  });
});

const StartTaskComponent = ({taskId}) => {
  const [startTask, {reportId}] = useStartTask();
  return (
    <div>
      {reportId && <span data-testid="report">{reportId}</span>}
      <button data-testid="start" onClick={() => startTask(taskId)} />
    </div>
  );
};

describe('useStartTask tests', () => {
  test('should start a task after user interaction', async () => {
    const [mock, resultFunc] = createStartTaskQueryMock('t1', 'r1');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<StartTaskComponent taskId="t1" />);

    const button = screen.getByTestId('start');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.getByTestId('report')).toHaveTextContent('r1');
  });
});

const CreateContainerTaskComponent = ({name, comment}) => {
  const [createContainerTask, {id: taskId}] = useCreateContainerTask();
  return (
    <div>
      {taskId && <span data-testid="task">{taskId}</span>}
      <button
        data-testid="create"
        onClick={() => createContainerTask({name, comment})}
      />
    </div>
  );
};

describe('useCreateContainerTask tests', () => {
  test('should create a container task after user interaction', async () => {
    const [mock, resultFunc] = createCreateContainerTaskQueryMock(
      'c1',
      'foo',
      't1',
    );
    const {render} = rendererWith({queryMocks: [mock]});

    render(<CreateContainerTaskComponent name="c1" comment="foo" />);

    const button = screen.getByTestId('create');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.getByTestId('task')).toHaveTextContent('t1');
  });
});

const CreateTaskComponent = ({data}) => {
  const [createTask, {id: taskId}] = useCreateTask();
  return (
    <div>
      {taskId && <span data-testid="task">{taskId}</span>}
      <button data-testid="create" onClick={() => createTask(data)} />
    </div>
  );
};

describe('useCreateTask tests', () => {
  test('should create a task after user interaction', async () => {
    const data = {
      name: 't1',
      comment: 'foo',
      scanConfigId: 's1',
      scannerId: 's1',
      targetId: 't1',
    };

    const [mock, resultFunc] = createCreateTaskQueryMock(data, 't1');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<CreateTaskComponent data={data} />);

    const button = screen.getByTestId('create');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.getByTestId('task')).toHaveTextContent('t1');
  });
});

const ModifyTaskComponent = ({data}) => {
  const [modifyTask] = useModifyTask();
  return (
    <div>
      <button data-testid="modify" onClick={() => modifyTask(data)} />
    </div>
  );
};

describe('useModifyTask tests', () => {
  test('should modify a task after user interaction', async () => {
    const data = {
      name: 't1',
      comment: 'foo',
      scanConfigId: 's1',
      scannerId: 's1',
      targetId: 't1',
    };

    const [mock, resultFunc] = createModifyTaskQueryMock(data, 't1');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ModifyTaskComponent data={data} />);

    const button = screen.getByTestId('modify');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const StopTaskComponent = ({taskId}) => {
  const [stopTask] = useStopTask();
  return (
    <div>
      <button data-testid="stop" onClick={() => stopTask(taskId)} />
    </div>
  );
};

describe('useStopTask tests', () => {
  test('should stop a task after user interaction', async () => {
    const [mock, resultFunc] = createStopTaskQueryMock('t1');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<StopTaskComponent taskId="t1" />);

    const button = screen.getByTestId('stop');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const ResumeTaskComponent = ({taskId}) => {
  const [resumeTask] = useResumeTask();
  return (
    <div>
      <button data-testid="resume" onClick={() => resumeTask(taskId)} />
    </div>
  );
};

describe('useResumeTask tests', () => {
  test('should resume a task after user interaction', async () => {
    const [mock, resultFunc] = createResumeTaskQueryMock('t1');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ResumeTaskComponent taskId="t1" />);

    const button = screen.getByTestId('resume');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const GetTaskComponent = ({id}) => {
  const {loading, task, error} = useGetTask(id, {cache: 'no-cache'});
  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      {error && <div data-testid="error">{error.message}</div>}
      {task && (
        <div data-testid="task">
          <span data-testid="id">{task.id}</span>
          <span data-testid="name">{task.name}</span>
        </div>
      )}
    </div>
  );
};

describe('useGetTask tests', () => {
  test('should load task', async () => {
    const id = '12345';
    const [queryMock, resultFunc] = createGetTaskQueryMock(id);

    const {render} = rendererWith({queryMocks: [queryMock]});

    render(<GetTaskComponent id={id} />);

    expect(screen.queryByTestId('loading')).toBeInTheDocument();

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();

    expect(screen.getByTestId('task')).toBeInTheDocument();

    expect(screen.getByTestId('id')).toHaveTextContent('123');
    expect(screen.getByTestId('name')).toHaveTextContent('foo');
  });

  test('should handle error', async () => {
    const id = '12345';
    const [queryMock] = createGetTaskQueryErrorMock(id);

    const {render} = rendererWith({queryMocks: [queryMock]});

    render(<GetTaskComponent id={id} />);

    expect(screen.queryByTestId('loading')).toBeInTheDocument();

    await wait();

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error')).toBeInTheDocument();

    expect(screen.queryByTestId('error')).toHaveTextContent(
      'An error occurred.',
    );
  });
});
