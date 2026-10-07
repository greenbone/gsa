/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import {type CredentialCommandCreateParams} from 'gmp/commands/credential';
import {USERNAME_PASSWORD_CREDENTIAL_TYPE} from 'gmp/models/credential';
import {createSession} from 'gmp/testing';
import {useCreateCredential} from 'web/hooks/use-query/credential';

const createGmp = () => ({
  session: createSession({token: 'test-token'}),
  settings: {},
  credential: {
    create: testing.fn().mockResolvedValue({data: {id: 'credential-1'}}),
  },
});

describe('useCreateCredential', () => {
  test('should create a credential', async () => {
    const gmp = createGmp();
    const input: CredentialCommandCreateParams = {
      name: 'Credential 1',
      credentialType: USERNAME_PASSWORD_CREDENTIAL_TYPE,
      credentialLogin: 'admin',
    };
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useCreateCredential();
      return <button onClick={() => mutation.mutate(input)}>Create</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));

    await waitFor(() => {
      expect(gmp.credential.create).toHaveBeenCalledWith(input);
    });
  });

  test('should call onSuccess with the created credential data', async () => {
    const gmp = createGmp();
    const onSuccess = testing.fn();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useCreateCredential({onSuccess});
      return (
        <button
          onClick={() =>
            mutation.mutate({
              name: 'Credential 1',
              credentialType: USERNAME_PASSWORD_CREDENTIAL_TYPE,
            })
          }
        >
          Create
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({id: 'credential-1'});
    });
  });

  test('should call onError when creating a credential fails', async () => {
    const error = new Error('Create failed');
    const gmp = createGmp();
    gmp.credential.create.mockRejectedValue(error);
    const onError = testing.fn();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useCreateCredential({onError});
      return (
        <button onClick={() => mutation.mutate({name: 'Credential 1'})}>
          Create
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));

    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
  });
});
