/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import {createSession} from 'gmp/testing';
import {
  useEditCredentialStore,
  useVerifyCredentialStore,
} from 'web/hooks/use-query/credential-store';

const createGmp = () => ({
  session: createSession({token: 'test-token'}),
  settings: {},
  credentialstore: {
    edit: testing.fn().mockResolvedValue({data: {id: 'credential-1'}}),
    verify: testing.fn().mockResolvedValue({data: {id: 'credential-1'}}),
  },
});

describe('useEditCredentialStore', () => {
  test('should edit a credential store', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const input = {id: 'credential-1', active: true};
    const TestComponent = () => {
      const mutation = useEditCredentialStore({});
      return <button onClick={() => mutation.mutate(input)}>Run</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Run'}));
    await waitFor(() => {
      expect(gmp.credentialstore.edit).toHaveBeenCalledWith(input);
    });
  });

  test('should call onError when editing a credential store fails', async () => {
    const error = new Error('Edit failed');
    const gmp = createGmp();
    gmp.credentialstore.edit.mockRejectedValue(error);
    const onError = testing.fn();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useEditCredentialStore({onError});
      return (
        <button
          onClick={() => mutation.mutate({id: 'credential-1', active: true})}
        >
          Run
        </button>
      );
    };
    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Run'}));
    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
  });
});

describe('useVerifyCredentialStore', () => {
  test('should verify a credential store', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const input = {id: 'credential-1'};
    const TestComponent = () => {
      const mutation = useVerifyCredentialStore({});
      return <button onClick={() => mutation.mutate(input)}>Run</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Run'}));
    await waitFor(() => {
      expect(gmp.credentialstore.verify).toHaveBeenCalledWith(input);
    });
  });

  test('should call onError when verifying a credential store fails', async () => {
    const error = new Error('Verify failed');
    const gmp = createGmp();
    gmp.credentialstore.verify.mockRejectedValue(error);
    const onError = testing.fn();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useVerifyCredentialStore({onError});
      return (
        <button onClick={() => mutation.mutate({id: 'credential-1'})}>
          Run
        </button>
      );
    };
    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Run'}));
    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
  });
});
