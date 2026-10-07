/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import {createSession} from 'gmp/testing';
import {
  useCloneOciImageTarget,
  useCreateOciImageTarget,
  useDeleteOciImageTarget,
  useSaveOciImageTarget,
} from 'web/hooks/use-query/oci-image-target';

const target = {id: 'target-1', name: 'Target 1'};

const createGmp = () => ({
  session: createSession({token: 'test-token'}),
  settings: {},
  ociimagetarget: {
    create: testing.fn().mockResolvedValue({data: {id: 'target-2'}}),
    save: testing.fn().mockResolvedValue({data: {id: 'target-1'}}),
    delete: testing.fn().mockResolvedValue(undefined),
    clone: testing.fn().mockResolvedValue({data: {id: 'target-2'}}),
  },
});

describe('useCreateOciImageTarget', () => {
  test('should create an OCI image target', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const input = {name: 'New Target', imageReferences: 'registry/image'};

    const TestComponent = () => {
      const mutation = useCreateOciImageTarget({});
      return <button onClick={() => mutation.mutate(input)}>Create</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));

    await waitFor(() => {
      expect(gmp.ociimagetarget.create.mock.calls[0][0]).toEqual(input);
    });
  });
});

describe('useSaveOciImageTarget', () => {
  test('should save an OCI image target', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const input = {id: target.id, name: 'Saved'};

    const TestComponent = () => {
      const mutation = useSaveOciImageTarget({});
      return <button onClick={() => mutation.mutate(input)}>Save</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    await waitFor(() => {
      expect(gmp.ociimagetarget.save.mock.calls[0][0]).toEqual(input);
    });
  });
});

describe('useDeleteOciImageTarget', () => {
  test('should delete an OCI image target', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useDeleteOciImageTarget({});
      return (
        <button onClick={() => mutation.mutate({id: target.id})}>Delete</button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));

    await waitFor(() => {
      expect(gmp.ociimagetarget.delete).toHaveBeenCalledWith({id: target.id});
    });
  });
});

describe('useCloneOciImageTarget', () => {
  test('should clone an OCI image target', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useCloneOciImageTarget({});
      return (
        <button
          onClick={() =>
            mutation.mutate({id: target.id, name: 'Cloned Target'})
          }
        >
          Clone
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Clone'}));

    await waitFor(() => {
      expect(gmp.ociimagetarget.clone).toHaveBeenCalledWith({id: target.id});
    });
  });
});
