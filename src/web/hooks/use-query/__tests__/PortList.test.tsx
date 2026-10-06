/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import {createSession} from 'gmp/testing';
import {
  useClonePortList,
  useCreatePortList,
  useCreatePortRange,
  useDeletePortList,
  useDeletePortRange,
  useImportPortList,
  useSavePortList,
} from 'web/hooks/use-query/port-list';

const createGmp = () => ({
  session: createSession({token: 'test-token'}),
  settings: {},
  portlist: {
    create: testing.fn().mockResolvedValue({data: {id: 'port-list-1'}}),
    save: testing.fn().mockResolvedValue({data: {id: 'port-list-1'}}),
    clone: testing.fn().mockResolvedValue({data: {id: 'port-list-2'}}),
    delete: testing.fn().mockResolvedValue(undefined),
    import: testing.fn().mockResolvedValue({data: {id: 'port-list-1'}}),
    createPortRange: testing.fn().mockResolvedValue({
      data: {id: 'port-range-1'},
    }),
    deletePortRange: testing.fn().mockResolvedValue(undefined),
  },
});

describe('useCreatePortList', () => {
  test('should create a port list', async () => {
    const gmp = createGmp();
    const input = {
      name: 'Port List 1',
      comment: 'Port list comment',
      portRange: '1-1024',
    };
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useCreatePortList();
      return <button onClick={() => mutation.mutate(input)}>Create</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));

    await waitFor(() => {
      expect(gmp.portlist.create).toHaveBeenCalledWith(input);
    });
  });

  test('should call onSuccess with the created port list data', async () => {
    const gmp = createGmp();
    const onSuccess = testing.fn();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useCreatePortList({onSuccess});
      return (
        <button
          onClick={() =>
            mutation.mutate({name: 'Port List 1', portRange: '1-1024'})
          }
        >
          Create
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({id: 'port-list-1'});
    });
  });

  test('should call onError when creating a port list fails', async () => {
    const error = new Error('Create failed');
    const gmp = createGmp();
    gmp.portlist.create.mockRejectedValue(error);
    const onError = testing.fn();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useCreatePortList({onError});
      return (
        <button onClick={() => mutation.mutate({name: 'Port List 1'})}>
          Create
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));

    await waitFor(() => expect(onError.mock.calls[0][0]).toBe(error));
  });
});

describe('useSavePortList', () => {
  test('should save a port list', async () => {
    const gmp = createGmp();
    const input = {id: 'port-list-1', name: 'Saved Port List'};
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useSavePortList();
      return <button onClick={() => mutation.mutate(input)}>Save</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    await waitFor(() => {
      expect(gmp.portlist.save).toHaveBeenCalledWith(input);
    });
  });
});

describe('useClonePortList', () => {
  test('should clone a port list by ID', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useClonePortList();
      return (
        <button
          onClick={() =>
            mutation.mutate({id: 'port-list-1', name: 'Cloned Port List'})
          }
        >
          Clone
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Clone'}));

    await waitFor(() => {
      expect(gmp.portlist.clone).toHaveBeenCalledWith({id: 'port-list-1'});
    });
  });
});

describe('useDeletePortList', () => {
  test('should delete a port list by ID', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useDeletePortList();
      return (
        <button
          onClick={() =>
            mutation.mutate({id: 'port-list-1', name: 'Deleted Port List'})
          }
        >
          Delete
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));

    await waitFor(() => {
      expect(gmp.portlist.delete).toHaveBeenCalledWith({
        id: 'port-list-1',
      });
    });
  });
});

describe('useImportPortList', () => {
  test('should import a port list', async () => {
    const gmp = createGmp();
    const input = {xmlFile: new File(['port list'], 'port-list.xml')};
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useImportPortList();
      return <button onClick={() => mutation.mutate(input)}>Import</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Import'}));

    await waitFor(() => {
      expect(gmp.portlist.import).toHaveBeenCalledWith(input);
    });
  });
});

describe('useCreatePortRange', () => {
  test('should create a port range', async () => {
    const gmp = createGmp();
    const input = {
      portListId: 'port-list-1',
      portRangeStart: 1,
      portRangeEnd: 1024,
      portType: 'tcp',
    };
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useCreatePortRange();
      return <button onClick={() => mutation.mutate(input)}>Create</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));

    await waitFor(() => {
      expect(gmp.portlist.createPortRange).toHaveBeenCalledWith(input);
    });
  });
});

describe('useDeletePortRange', () => {
  test('should delete a port range', async () => {
    const gmp = createGmp();
    const input = {id: 'port-range-1', portListId: 'port-list-1'};
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useDeletePortRange();
      return <button onClick={() => mutation.mutate(input)}>Delete</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));

    await waitFor(() => {
      expect(gmp.portlist.deletePortRange).toHaveBeenCalledWith({
        id: 'port-range-1',
      });
    });
  });
});
