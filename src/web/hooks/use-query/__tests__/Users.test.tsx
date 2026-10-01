/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import {createSession} from 'gmp/testing';
import {useCreateUser, useSaveUser} from 'web/hooks/use-query/users';

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

const createGmp = (user: Record<string, unknown>) => ({
  session: createSession({token: 'test-token'}),
  settings: {},
  user,
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

    await waitFor(() => {
      expect(create).toHaveBeenCalledWith(userData);
    });
  });
  test('calls onSuccess with created user data', async () => {
    const create = testing.fn().mockResolvedValue({data: {id: 'created'}});
    const onSuccess = testing.fn();
    const gmp = createGmp({create});
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useCreateUser({onSuccess});
      return <button onClick={() => mutation.mutate(userData)}>Create</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({id: 'created'});
    });
  });

  test('calls onError when creating a user fails', async () => {
    const error = new Error('Create failed');
    const create = testing.fn().mockRejectedValue(error);
    const onError = testing.fn();
    const gmp = createGmp({create});
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useCreateUser({onError});
      return <button onClick={() => mutation.mutate(userData)}>Create</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0]).toBe(error);
    });
  });
});

describe('useSaveUser', () => {
  test('forwards accessHosts arrays and derives oldName when saving', async () => {
    const save = testing.fn().mockResolvedValue({data: {id: 'saved'}});
    const gmp = createGmp({save});
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useSaveUser();
      return (
        <button onClick={() => mutation.mutate({...userData, id: 'user-id'})}>
          Save
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    await waitFor(() => {
      expect(save).toHaveBeenCalledWith({
        ...userData,
        id: 'user-id',
        oldName: userData.name,
      });
    });
  });

  test('preserves an explicit oldName when saving', async () => {
    const save = testing.fn().mockResolvedValue({data: {id: 'saved'}});
    const gmp = createGmp({save});
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useSaveUser();
      return (
        <button
          onClick={() =>
            mutation.mutate({
              ...userData,
              id: 'user-id',
              oldName: 'previous-user',
            })
          }
        >
          Save
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    await waitFor(() => {
      expect(save).toHaveBeenCalledWith({
        ...userData,
        id: 'user-id',
        oldName: 'previous-user',
      });
    });
  });

  test('calls onSuccess with saved user data', async () => {
    const save = testing.fn().mockResolvedValue({data: {id: 'saved'}});
    const onSuccess = testing.fn();
    const gmp = createGmp({save});
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useSaveUser({onSuccess});
      return (
        <button onClick={() => mutation.mutate({...userData, id: 'user-id'})}>
          Save
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({id: 'saved'});
    });
  });

  test('calls onError when saving a user fails', async () => {
    const error = new Error('Save failed');
    const save = testing.fn().mockRejectedValue(error);
    const onError = testing.fn();
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

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0]).toBe(error);
    });
  });
});
