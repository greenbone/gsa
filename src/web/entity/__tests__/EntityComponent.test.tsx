/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, fireEvent, rendererWith, wait} from 'web/testing';
import date from 'gmp/models/date';
import Model from 'gmp/models/model';
import {createSession} from 'gmp/testing';
import {type EntityType} from 'gmp/utils/entity-type';
import EntityComponent from 'web/entity/EntityComponent';

const currentSettingsResponse = {
  data: {
    detailsexportfilename: {
      id: 'a6ac88c5-729c-41ba-ac0a-deea4a3441f2',
      name: 'Details Export File Name',
      value: '%T-%U',
    },
  },
};

const createGmp = ({
  currentSettings = testing.fn().mockResolvedValue(currentSettingsResponse),
  fooExport = testing.fn().mockResolvedValue({data: {id: '123'}}),
  fooClone = testing.fn().mockResolvedValue({id: '123'}),
  fooDelete = testing.fn().mockResolvedValue(undefined),
  fooSave = testing.fn().mockResolvedValue({id: '123'}),
  fooCreate = testing.fn().mockResolvedValue({id: '123'}),
} = {}) => ({
  session: createSession(),
  user: {
    currentSettings,
  },
  foo: {
    export: fooExport,
    clone: fooClone,
    delete: fooDelete,
    save: fooSave,
    create: fooCreate,
  },
});

describe('EntityComponent tests', () => {
  test('should render', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp});
    render(
      <EntityComponent
        name={'foo' as EntityType}
        onCloneError={testing.fn()}
        onCloned={testing.fn()}
        onCreateError={testing.fn()}
        onCreated={testing.fn()}
        onDeleteError={testing.fn()}
        onDeleted={testing.fn()}
        onDownloadError={testing.fn()}
        onDownloaded={testing.fn()}
        onSaveError={testing.fn()}
        onSaved={testing.fn()}
      >
        {() => <div data-testid="child"></div>}
      </EntityComponent>,
    );

    expect(screen.queryByTestId('child')).toBeInTheDocument();
  });

  test('should allow cloning an entity', async () => {
    const onCloned = testing.fn();
    const onCloneError = testing.fn();

    const gmp = createGmp();
    const {render} = rendererWith({gmp});
    render(
      <EntityComponent
        name={'foo' as EntityType}
        onCloneError={onCloneError}
        onCloned={onCloned}
      >
        {({clone}) => (
          <button
            data-testid="button"
            onClick={() => clone(new Model({id: '123'}))}
          />
        )}
      </EntityComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onCloned).toHaveBeenCalledWith({id: '123'});
    expect(onCloneError).not.toHaveBeenCalled();
  });

  test('should call onCloneError when cloning an entity fails', async () => {
    const error = new Error('error');
    const onCloned = testing.fn();
    const onCloneError = testing.fn();

    const gmp = createGmp({
      fooClone: testing.fn().mockRejectedValue(error),
    });
    const {render} = rendererWith({gmp});
    render(
      <EntityComponent
        name={'foo' as EntityType}
        onCloneError={onCloneError}
        onCloned={onCloned}
      >
        {({clone}) => (
          <button
            data-testid="button"
            onClick={() => clone(new Model({id: '123'}))}
          />
        )}
      </EntityComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onCloneError).toHaveBeenCalledWith(error);
    expect(onCloned).not.toHaveBeenCalled();
  });

  test('should allow deleting an entity', async () => {
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();
    const model = new Model({id: '123'});

    const gmp = createGmp();
    const {render} = rendererWith({gmp});
    render(
      <EntityComponent
        name={'foo' as EntityType}
        onDeleteError={onDeleteError}
        onDeleted={onDeleted}
      >
        {({delete: del}) => (
          <button data-testid="button" onClick={() => del(model)} />
        )}
      </EntityComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onDeleted).toHaveBeenCalledOnce(); // currently the redux action for deleting an entity is passed
    expect(onDeleteError).not.toHaveBeenCalled();
  });

  test('should call onDeleteError when deleting an entity fails', async () => {
    const error = new Error('error');
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();
    const model = new Model({id: '123'});

    const gmp = createGmp({
      fooDelete: testing.fn().mockRejectedValue(error),
    });
    const {render} = rendererWith({gmp});
    render(
      <EntityComponent
        name={'foo' as EntityType}
        onDeleteError={onDeleteError}
        onDeleted={onDeleted}
      >
        {({delete: del}) => (
          <button data-testid="button" onClick={() => del(model)} />
        )}
      </EntityComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onDeleteError).toHaveBeenCalledWith(error);
    expect(onDeleted).not.toHaveBeenCalled();
  });

  test('should allow saving an entity', async () => {
    const onSaved = testing.fn();
    const onSaveError = testing.fn();

    const gmp = createGmp();
    const {render} = rendererWith({gmp});
    render(
      <EntityComponent
        name={'foo' as EntityType}
        onSaveError={onSaveError}
        onSaved={onSaved}
      >
        {({save}) => (
          <button data-testid="button" onClick={() => save({id: '123'})} />
        )}
      </EntityComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onSaved).toHaveBeenCalledWith({id: '123'});
    expect(onSaveError).not.toHaveBeenCalled();
  });

  test('should call onSaveError when saving an entity fails', async () => {
    const error = new Error('error');
    const onSaved = testing.fn();
    const onSaveError = testing.fn();

    const gmp = createGmp({
      fooSave: testing.fn().mockRejectedValue(error),
    });
    const {render} = rendererWith({gmp});
    render(
      <EntityComponent
        name={'foo' as EntityType}
        onSaveError={onSaveError}
        onSaved={onSaved}
      >
        {({save}) => (
          <button data-testid="button" onClick={() => save({id: '123'})} />
        )}
      </EntityComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onSaveError).toHaveBeenCalledWith(error);
    expect(onSaved).not.toHaveBeenCalled();
  });

  test('should allow to create an entity', async () => {
    const onCreated = testing.fn();
    const onCreateError = testing.fn();

    const gmp = createGmp();
    const {render} = rendererWith({gmp});
    render(
      <EntityComponent
        name={'foo' as EntityType}
        onCreateError={onCreateError}
        onCreated={onCreated}
      >
        {({create}) => (
          <button data-testid="button" onClick={() => create({})} />
        )}
      </EntityComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onCreated).toHaveBeenCalledWith({id: '123'});
    expect(onCreateError).not.toHaveBeenCalled();
  });

  test('should call onCreateError when creating an entity fails', async () => {
    const error = new Error('error');
    const onCreated = testing.fn();
    const onCreateError = testing.fn();

    const gmp = createGmp({
      fooCreate: testing.fn().mockRejectedValue(error),
    });
    const {render} = rendererWith({gmp});
    render(
      <EntityComponent
        name={'foo' as EntityType}
        onCreateError={onCreateError}
        onCreated={onCreated}
      >
        {({create}) => (
          <button data-testid="button" onClick={() => create({})} />
        )}
      </EntityComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onCreateError).toHaveBeenCalledWith(error);
    expect(onCreated).not.toHaveBeenCalled();
  });

  test('should allow to download an entity', async () => {
    const entity = new Model(
      {
        id: '123',
        name: 'foo',
        creationTime: date('2025-01-01T00:00:00Z'),
        modificationTime: date('2025-01-01T00:00:00Z'),
      },
      'foo' as EntityType,
    );
    const onDownloaded = testing.fn();
    const onDownloadError = testing.fn();

    const gmp = createGmp();
    const {render} = rendererWith({gmp, store: true});
    render(
      <EntityComponent
        name={'foo' as EntityType}
        onDownloadError={onDownloadError}
        onDownloaded={onDownloaded}
      >
        {({download}) => (
          <button data-testid="button" onClick={() => download(entity)} />
        )}
      </EntityComponent>,
    );
    await wait(); // wait for currentSettings to be resolved and put into the store
    expect(gmp.user.currentSettings).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onDownloaded).toHaveBeenCalledWith({
      filename: 'foo-123.xml',
      data: {id: '123'},
    });
    expect(onDownloadError).not.toHaveBeenCalled();
  });

  test('should call onDownloadError when downloading an entity fails', async () => {
    const error = new Error('error');
    const entity = new Model({id: '123'});
    const onDownloaded = testing.fn();
    const onDownloadError = testing.fn();

    const gmp = createGmp({
      fooExport: testing.fn().mockRejectedValue(error),
    });
    const {render} = rendererWith({gmp, store: true});
    render(
      <EntityComponent
        name={'foo' as EntityType}
        onDownloadError={onDownloadError}
        onDownloaded={onDownloaded}
      >
        {({download}) => (
          <button data-testid="button" onClick={() => download(entity)} />
        )}
      </EntityComponent>,
    );

    await wait(); // wait for currentSettings to be resolved and put into the store
    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onDownloadError).toHaveBeenCalledWith(error);
    expect(onDownloaded).not.toHaveBeenCalled();
  });
});
