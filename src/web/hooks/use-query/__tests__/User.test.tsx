/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import User from 'gmp/models/user';
import {createSession} from 'gmp/testing';
import {
  useCloneUser,
  useCreateUser,
  useDeleteUser,
  useDownloadUser,
  useGetUser,
  useSaveUser,
} from 'web/hooks/use-query/user';

const userData = {
  accessHosts: ['localhost', '127.0.0.1'],
  authMethod: 'password',
  comment: 'comment',
  groupIds: ['group-id'],
  hostsAllow: '0',
  name: 'user',
  password: 'password',
  roleIds: ['role-id'],
};

const user = new User({id: 'user-id', name: 'user'});

const createGmp = (
  userMethods: Record<string, unknown> = {},
  token = 'test-token',
) => ({
  session: createSession({token}),
  settings: {},
  user: {
    get: testing.fn().mockResolvedValue({data: user}),
    create: testing.fn().mockResolvedValue({data: {id: 'created'}}),
    save: testing.fn().mockResolvedValue({data: {id: 'saved'}}),
    clone: testing.fn().mockResolvedValue({data: {id: 'cloned'}}),
    delete: testing.fn().mockResolvedValue(undefined),
    export: testing.fn().mockResolvedValue({data: 'user-content'}),
    ...userMethods,
  },
});

describe('useGetUser', () => {
  test('should fetch a user by ID', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {data} = useGetUser({id: 'user-id'});
      return <div data-testid="user">{data?.name}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('user');
    });

    expect(gmp.user.get).toHaveBeenCalledWith({id: 'user-id'});
  });

  test('should not fetch a user without a session token', () => {
    const gmp = createGmp({}, '');
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetUser({id: 'user-id'});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmp.user.get).not.toHaveBeenCalled();
  });

  test('should not fetch a user when the ID is empty', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetUser({id: ''});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmp.user.get).not.toHaveBeenCalled();
  });
});

describe('useCreateUser', () => {
  test('forwards access_hosts arrays when creating a user', async () => {
    const create = testing.fn().mockResolvedValue({data: {id: 'created'}});
    const gmp = createGmp({create});
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useCreateUser();
      return <button onClick={() => mutation.mutate(userData)}>Create</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));

    await waitFor(() => expect(create).toHaveBeenCalledWith(userData));
  });

  test('calls onSuccess with created user data', async () => {
    const onSuccess = testing.fn();
    const gmp = createGmp({onSuccess: undefined});
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useCreateUser({onSuccess});
      return <button onClick={() => mutation.mutate(userData)}>Create</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));

    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith({id: 'created'}),
    );
  });

  test('calls onError when creating a user fails', async () => {
    const error = new Error('Create failed');
    const onError = testing.fn();
    const gmp = createGmp({create: testing.fn().mockRejectedValue(error)});
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useCreateUser({onError});
      return <button onClick={() => mutation.mutate(userData)}>Create</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));

    await waitFor(() => expect(onError.mock.calls[0][0]).toBe(error));
  });
});

describe('useSaveUser', () => {
  test('derives oldName when saving', async () => {
    const save = testing.fn().mockResolvedValue({data: {id: 'saved'}});
    const gmp = createGmp({save});
    const {render} = rendererWith({gmp, router: true});
    const input = {...userData, id: 'user-id'};

    const TestComponent = () => {
      const mutation = useSaveUser();
      return <button onClick={() => mutation.mutate(input)}>Save</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    await waitFor(() => {
      expect(save).toHaveBeenCalledWith({...input, oldName: userData.name});
    });
  });

  test('preserves an explicit oldName when saving', async () => {
    const save = testing.fn().mockResolvedValue({data: {id: 'saved'}});
    const gmp = createGmp({save});
    const {render} = rendererWith({gmp, router: true});
    const input = {...userData, id: 'user-id', oldName: 'previous-user'};

    const TestComponent = () => {
      const mutation = useSaveUser();
      return <button onClick={() => mutation.mutate(input)}>Save</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    await waitFor(() => expect(save).toHaveBeenCalledWith(input));
  });

  test('calls callbacks when saving fails', async () => {
    const error = new Error('Save failed');
    const onError = testing.fn();
    const save = testing.fn().mockRejectedValue(error);
    const gmp = createGmp({save});
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useSaveUser({onError});
      return (
        <button onClick={() => mutation.mutate({...userData, id: 'user-id'})}>
          Save
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    await waitFor(() => expect(onError.mock.calls[0][0]).toBe(error));
  });
});

describe('remaining user mutation hooks', () => {
  test('should clone a user', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useCloneUser();
      return (
        <button onClick={() => mutation.mutate({id: 'user-id'})}>Clone</button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Clone'}));
    await waitFor(() =>
      expect(gmp.user.clone).toHaveBeenCalledWith({id: 'user-id'}),
    );
  });

  test('should delete a user and forward the inheritor ID', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const input = {id: 'user-id', inheritorId: 'inheritor-id'};
    const TestComponent = () => {
      const mutation = useDeleteUser();
      return <button onClick={() => mutation.mutate(input)}>Delete</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));
    await waitFor(() => expect(gmp.user.delete).toHaveBeenCalledWith(input));
  });

  test('should download a user', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useDownloadUser();
      return (
        <button onClick={() => mutation.mutate({id: 'user-id'})}>
          Download
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Download'}));
    await waitFor(() =>
      expect(gmp.user.export).toHaveBeenCalledWith({id: 'user-id'}),
    );
  });
});
