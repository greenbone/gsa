/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait} from 'web/testing';
import Response from 'gmp/http/response';
import ResourceName from 'gmp/models/resource-name';
import Setting from 'gmp/models/setting';
import Tag from 'gmp/models/tag';
import Task from 'gmp/models/task';
import {YES_VALUE} from 'gmp/parser';
import Button from 'web/components/form/Button';
import TagComponent from 'web/pages/tags/TagComponent';

const createGmp = ({
  createTagResponse = {id: '123'},
  saveTagResponse = {id: '123'},
  getTagResponse = new Response(
    new Tag({
      id: '123',
      name: 'My Tag',
      comment: '',
      active: YES_VALUE,
      resourceType: 'task',
      value: 'Some Value',
    }),
  ),
  deleteTagResponse = undefined,
  cloneTagResponse = {id: '123'},
  downloadTagResponse = {data: 'some-data'},
  enableTagResponse = undefined,
  disableTagResponse = undefined,
  getTasksResponse = new Response([new Task({id: '1', name: 'Task 1'})]),
  getResourceNamesResponse = new Response([
    new ResourceName({id: '123', name: 'Task', type: 'task'}),
  ]),
  createTag = testing.fn().mockResolvedValue(createTagResponse),
  saveTag = testing.fn().mockResolvedValue(saveTagResponse),
  cloneTag = testing.fn().mockResolvedValue(cloneTagResponse),
  getTag = testing.fn().mockResolvedValue(getTagResponse),
  deleteTag = testing.fn().mockResolvedValue(deleteTagResponse),
  downloadTag = testing.fn().mockResolvedValue(downloadTagResponse),
  enableTag = testing.fn().mockResolvedValue(enableTagResponse),
  disableTag = testing.fn().mockResolvedValue(disableTagResponse),
  getTasks = testing.fn().mockResolvedValue(getTasksResponse),
  getResourceNames = testing.fn().mockResolvedValue(getResourceNamesResponse),
} = {}) => {
  return {
    settings: {
      enableGreenboneSensor: true,
      enableKrb5: false,
    },
    user: {
      currentSettings: testing.fn().mockResolvedValue(
        new Response({
          detailsexportfilename: new Setting({
            _id: 'a6ac88c5-729c-41ba-ac0a-deea4a3441f2',
            name: 'Details Export File Name',
            value: '%T-%U',
          }),
        }),
      ),
    },
    tag: {
      clone: cloneTag,
      create: createTag,
      export: downloadTag,
      get: getTag,
      save: saveTag,
      enable: enableTag,
      disable: disableTag,
      delete: deleteTag,
    },
    tasks: {
      get: getTasks,
    },
    resourcenames: {
      getAll: getResourceNames,
    },
  };
};

describe('TagComponent tests', () => {
  test('should render', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <TagComponent>{() => <Button data-testid="button" />}</TagComponent>,
    );

    expect(screen.getByTestId('button')).toBeInTheDocument();
  });

  test('should allow to create a new tag', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, capabilities: true});
    const onCreated = testing.fn();

    render(
      <TagComponent onCreated={onCreated}>
        {({create}) => <Button data-testid="button" onClick={() => create()} />}
      </TagComponent>,
    );

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    await wait();

    expect(screen.getDialog()).toBeInTheDocument();
    fireEvent.click(screen.getDialogSaveButton());

    expect(gmp.tag.create).toHaveBeenCalledWith({
      active: true,
      comment: '',
      id: undefined,
      name: 'default:unnamed',
      resourceIds: [],
      resourceType: undefined,
      value: '',
    });

    await wait();

    expect(onCreated).toHaveBeenCalled();
  });

  test('should allow to edit an existing tag', async () => {
    const gmp = createGmp();
    const tag = new Tag({name: 'My Tag', id: '1234', resourceType: 'task'});
    const onSaved = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <TagComponent onSaved={onSaved}>
        {({edit}) => <Button data-testid="button" onClick={() => edit(tag)} />}
      </TagComponent>,
    );

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    await wait();

    expect(screen.getDialog()).toBeInTheDocument();
    fireEvent.click(screen.getDialogSaveButton());

    expect(gmp.tag.save).toHaveBeenCalledWith({
      active: true,
      comment: '',
      id: '1234',
      name: 'My Tag',
      resourceIds: ['1'],
      resourceType: 'task',
      value: 'Some Value',
    });

    await wait();

    expect(onSaved).toHaveBeenCalled();
  });

  test('should allow to clone an existing tag', async () => {
    const gmp = createGmp();
    const tag = new Tag({name: 'My Tag', id: '1234', resourceType: 'task'});
    const onCloned = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <TagComponent onCloned={onCloned}>
        {({clone}) => (
          <Button data-testid="button" onClick={() => clone(tag)} />
        )}
      </TagComponent>,
    );

    const button = screen.getByTestId('button');
    fireEvent.click(button);
    expect(gmp.tag.clone).toHaveBeenCalledWith(tag);

    await wait();

    expect(onCloned).toHaveBeenCalled();
  });

  test('should allow to download a tag', async () => {
    const gmp = createGmp();
    const tag = new Tag({name: 'My Tag', id: '1234', resourceType: 'task'});

    const {render} = rendererWith({gmp, capabilities: true});
    const onDownloaded = testing.fn();

    render(
      <TagComponent onDownloadError={onDownloaded} onDownloaded={onDownloaded}>
        {({download}) => (
          <Button data-testid="button" onClick={() => download(tag)} />
        )}
      </TagComponent>,
    );

    // allow user settings to load
    await wait();

    const button = screen.getByTestId('button');
    fireEvent.click(button);
    expect(gmp.tag.export).toHaveBeenCalledWith(tag);

    await wait();

    expect(onDownloaded).toHaveBeenCalledWith({
      data: 'some-data',
      filename: 'tag-1234.xml',
    });
  });

  test('should allow to enable a tag', async () => {
    const gmp = createGmp();
    const tag = new Tag({name: 'My Tag', id: '1234', resourceType: 'task'});
    const onEnabled = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <TagComponent onEnabled={onEnabled}>
        {({enable}) => (
          <Button data-testid="button" onClick={() => enable(tag)} />
        )}
      </TagComponent>,
    );

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    expect(gmp.tag.enable).toHaveBeenCalledWith({id: tag.id});

    await wait();

    expect(onEnabled).toHaveBeenCalled();
  });

  test('should allow to disable a tag', async () => {
    const gmp = createGmp();
    const tag = new Tag({name: 'My Tag', id: '1234', resourceType: 'task'});
    const onDisabled = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <TagComponent onDisabled={onDisabled}>
        {({disable}) => (
          <Button data-testid="button" onClick={() => disable(tag)} />
        )}
      </TagComponent>,
    );

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    expect(gmp.tag.disable).toHaveBeenCalledWith({id: tag.id});

    await wait();

    expect(onDisabled).toHaveBeenCalled();
  });

  test('should allow to delete a tag', async () => {
    const gmp = createGmp();
    const tag = new Tag({name: 'My Tag', id: '1234', resourceType: 'task'});
    const onDeleted = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <TagComponent onDeleted={onDeleted}>
        {({delete: deleteTag}) => (
          <Button data-testid="button" onClick={() => deleteTag(tag)} />
        )}
      </TagComponent>,
    );

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    await wait();

    expect(gmp.tag.delete).toHaveBeenCalledWith({id: tag.id});
    expect(onDeleted).toHaveBeenCalled();
  });

  test('should allow to remove a tag', async () => {
    const gmp = createGmp();
    const onRemoved = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <TagComponent onRemoved={onRemoved}>
        {({remove}) => (
          <Button
            data-testid="button"
            onClick={() => remove('123', new Task({id: '234'}))}
          />
        )}
      </TagComponent>,
    );

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    await wait();

    expect(gmp.tag.save).toHaveBeenCalledWith({
      active: true,
      id: '123',
      name: 'My Tag',
      comment: '',
      resourceIds: ['234'],
      resourceType: 'task',
      resourcesAction: 'remove',
      value: 'Some Value',
    });
    expect(onRemoved).toHaveBeenCalled();
  });
});
