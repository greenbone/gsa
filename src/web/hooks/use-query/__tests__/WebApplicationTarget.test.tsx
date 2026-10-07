/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import {createSession} from 'gmp/testing';
import {
  useCloneWebApplicationTarget,
  useCreateWebApplicationTarget,
  useDeleteWebApplicationTarget,
  useSaveWebApplicationTarget,
} from 'web/hooks/use-query/web-application-target';

const target = {id: 'target-1', name: 'Target 1'};

const createGmp = () => ({
  session: createSession({token: 'test-token'}),
  settings: {},
  webapplicationtarget: {
    create: testing.fn().mockResolvedValue({data: {id: 'target-2'}}),
    save: testing.fn().mockResolvedValue({data: {id: 'target-1'}}),
    delete: testing.fn().mockResolvedValue(undefined),
    clone: testing.fn().mockResolvedValue({data: {id: 'target-2'}}),
  },
});

describe('useCreateWebApplicationTarget', () => {
  test('should create a web application target', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const input = {name: 'New Target', urls: 'https://example.com'};

    const TestComponent = () => {
      const mutation = useCreateWebApplicationTarget({});
      return <button onClick={() => mutation.mutate(input)}>Create</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));

    await waitFor(() => {
      expect(gmp.webapplicationtarget.create.mock.calls[0][0]).toEqual(input);
    });
  });
});

describe('useSaveWebApplicationTarget', () => {
  test('should save a web application target', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const input = {id: target.id, name: 'Saved'};

    const TestComponent = () => {
      const mutation = useSaveWebApplicationTarget({});
      return <button onClick={() => mutation.mutate(input)}>Save</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    await waitFor(() => {
      expect(gmp.webapplicationtarget.save.mock.calls[0][0]).toEqual(input);
    });
  });
});

describe('useDeleteWebApplicationTarget', () => {
  test('should delete a web application target', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useDeleteWebApplicationTarget({});
      return <button onClick={() => mutation.mutate(target)}>Delete</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));

    await waitFor(() => {
      expect(gmp.webapplicationtarget.delete).toHaveBeenCalledWith({
        id: target.id,
      });
    });
  });
});

describe('useCloneWebApplicationTarget', () => {
  test('should clone a web application target', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useCloneWebApplicationTarget({});
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
      expect(gmp.webapplicationtarget.clone).toHaveBeenCalledWith({
        id: target.id,
      });
    });
  });
});
