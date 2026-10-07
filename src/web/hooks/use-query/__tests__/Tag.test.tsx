/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import Tag from 'gmp/models/tag';
import {createSession} from 'gmp/testing';
import {
  useCloneTag,
  useCreateTag,
  useDeleteTag,
  useDisableTag,
  useEnableTag,
  useGetTag,
  useSaveTag,
} from 'web/hooks/use-query/tag';

const tag = new Tag({id: 'tag-1', name: 'Tag 1', value: 'value'});

const createGmp = () => ({
  session: createSession({token: 'test-token'}),
  settings: {},
  tag: {
    get: testing.fn().mockResolvedValue({data: tag}),
    delete: testing.fn().mockResolvedValue(undefined),
    enable: testing.fn().mockResolvedValue({data: {}}),
    disable: testing.fn().mockResolvedValue({data: {}}),
    create: testing.fn().mockResolvedValue({data: {id: 'tag-2'}}),
    save: testing.fn().mockResolvedValue({data: {id: 'tag-1'}}),
    clone: testing.fn().mockResolvedValue({data: {id: 'tag-2'}}),
  },
});

describe('useGetTag', () => {
  test('should fetch a tag by ID', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const {data} = useGetTag({id: 'tag-1'});
      return <div data-testid="tag">{data?.name}</div>;
    };

    render(<TestComponent />);
    await waitFor(() => {
      expect(screen.getByTestId('tag')).toHaveTextContent('Tag 1');
    });
    expect(gmp.tag.get).toHaveBeenCalledWith({id: 'tag-1'});
  });
});

describe('useDeleteTag', () => {
  test('should delete a tag', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useDeleteTag({});
      return (
        <button onClick={() => mutation.mutate({id: 'tag-1', name: 'tag-1'})}>
          Run
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Run'}));
    await waitFor(() => {
      expect(gmp.tag.delete).toHaveBeenCalledWith({id: 'tag-1'});
    });
  });
});

describe('useEnableTag', () => {
  test('should enable a tag', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useEnableTag({});
      return (
        <button onClick={() => mutation.mutate({id: 'tag-1'})}>Run</button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Run'}));
    await waitFor(() => {
      expect(gmp.tag.enable).toHaveBeenCalledWith({id: 'tag-1'});
    });
  });
});

describe('useDisableTag', () => {
  test('should disable a tag', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useDisableTag({});
      return (
        <button onClick={() => mutation.mutate({id: 'tag-1'})}>Run</button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Run'}));
    await waitFor(() => {
      expect(gmp.tag.disable).toHaveBeenCalledWith({id: 'tag-1'});
    });
  });
});

describe('useCreateTag', () => {
  test('should create a tag', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const input = {
      active: true,
      name: 'New Tag',
      resourceType: 'tag' as const,
      value: 'value',
    };
    const TestComponent = () => {
      const mutation = useCreateTag({});
      return <button onClick={() => mutation.mutate(input)}>Run</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Run'}));
    await waitFor(() => {
      expect(gmp.tag.create).toHaveBeenCalledWith(input);
    });
  });
});

describe('useSaveTag', () => {
  test('should save a tag', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const input = {
      active: true,
      id: 'tag-1',
      name: 'Saved Tag',
      resourceType: 'tag' as const,
    };
    const TestComponent = () => {
      const mutation = useSaveTag({});
      return <button onClick={() => mutation.mutate(input)}>Run</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Run'}));
    await waitFor(() => {
      expect(gmp.tag.save).toHaveBeenCalledWith(input);
    });
  });
});

describe('useCloneTag', () => {
  test('should clone a tag by ID', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useCloneTag({});
      return (
        <button
          onClick={() => mutation.mutate({id: 'tag-1', name: 'Cloned Tag'})}
        >
          Run
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Run'}));
    await waitFor(() => {
      expect(gmp.tag.clone).toHaveBeenCalledWith({id: 'tag-1'});
    });
  });
});
