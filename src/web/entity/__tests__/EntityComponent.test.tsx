/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, fireEvent, rendererWith, wait} from 'web/testing';
import date from 'gmp/models/date';
import Model from 'gmp/models/model';
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

describe('EntityComponent tests', () => {
  test('should render', () => {
    const exportFunc = testing.fn();
    const currentSettings = testing
      .fn()
      .mockResolvedValue(currentSettingsResponse);
    const gmp = {foo: {export: exportFunc}, user: {currentSettings}};
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
    const exportFunc = testing.fn();
    const currentSettings = testing
      .fn()
      .mockResolvedValue(currentSettingsResponse);
    const clonedData = {id: '123'};
    const onCloned = testing.fn();
    const onCloneError = testing.fn();

    const gmp = {
      foo: {
        clone: testing.fn().mockResolvedValue(clonedData),
        export: exportFunc,
      },
      user: {currentSettings},
    };
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
    expect(onCloned).toHaveBeenCalledWith(clonedData);
    expect(onCloneError).not.toHaveBeenCalled();
  });

  test('should call onCloneError when cloning an entity fails', async () => {
    const exportFunc = testing.fn();
    const currentSettings = testing
      .fn()
      .mockResolvedValue(currentSettingsResponse);
    const error = new Error('error');
    const onCloned = testing.fn();
    const onCloneError = testing.fn();

    const gmp = {
      foo: {clone: testing.fn().mockRejectedValue(error), export: exportFunc},
      user: {currentSettings},
    };
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
    const exportFunc = testing.fn();
    const currentSettings = testing
      .fn()
      .mockResolvedValue(currentSettingsResponse);
    const deletedData = {id: '123'};
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();
    const model = new Model({id: '123'});

    const gmp = {
      foo: {
        delete: testing.fn().mockResolvedValue(deletedData),
        export: exportFunc,
      },
      user: {currentSettings},
    };
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
    const exportFunc = testing.fn();
    const currentSettings = testing
      .fn()
      .mockResolvedValue(currentSettingsResponse);
    const error = new Error('error');
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();
    const model = new Model({id: '123'});

    const gmp = {
      foo: {delete: testing.fn().mockRejectedValue(error), export: exportFunc},
      user: {currentSettings},
    };
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
    const exportFunc = testing.fn();
    const currentSettings = testing
      .fn()
      .mockResolvedValue(currentSettingsResponse);
    const savedData = {id: '123'};
    const onSaved = testing.fn();
    const onSaveError = testing.fn();

    const gmp = {
      foo: {
        save: testing.fn().mockResolvedValue(savedData),
        export: exportFunc,
      },
      user: {currentSettings},
    };
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
    expect(onSaved).toHaveBeenCalledWith(savedData);
    expect(onSaveError).not.toHaveBeenCalled();
  });

  test('should call onSaveError when saving an entity fails', async () => {
    const exportFunc = testing.fn();
    const currentSettings = testing
      .fn()
      .mockResolvedValue(currentSettingsResponse);
    const error = new Error('error');
    const onSaved = testing.fn();
    const onSaveError = testing.fn();

    const gmp = {
      foo: {save: testing.fn().mockRejectedValue(error), export: exportFunc},
      user: {currentSettings},
    };
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
    const exportFunc = testing.fn();
    const currentSettings = testing
      .fn()
      .mockResolvedValue(currentSettingsResponse);
    const createdData = {id: '123'};
    const onCreated = testing.fn();
    const onCreateError = testing.fn();

    const gmp = {
      foo: {
        create: testing.fn().mockResolvedValue(createdData),
        export: exportFunc,
      },
      user: {currentSettings},
    };
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
    expect(onCreated).toHaveBeenCalledWith(createdData);
    expect(onCreateError).not.toHaveBeenCalled();
  });

  test('should call onCreateError when creating an entity fails', async () => {
    const exportFunc = testing.fn();
    const currentSettings = testing
      .fn()
      .mockResolvedValue(currentSettingsResponse);
    const error = new Error('error');
    const onCreated = testing.fn();
    const onCreateError = testing.fn();

    const gmp = {
      foo: {create: testing.fn().mockRejectedValue(error), export: exportFunc},
      user: {currentSettings},
    };
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
    const currentSettings = testing
      .fn()
      .mockResolvedValue(currentSettingsResponse);
    const entity = new Model(
      {
        id: '123',
        name: 'foo',
        creationTime: date('2025-01-01T00:00:00Z'),
        modificationTime: date('2025-01-01T00:00:00Z'),
      },
      'foo' as EntityType,
    );
    const downloadedData = {id: '123'};
    const onDownloaded = testing.fn();
    const onDownloadError = testing.fn();

    const gmp = {
      foo: {
        export: testing.fn().mockResolvedValue({data: downloadedData}),
      },
      user: {currentSettings},
    };
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
    expect(currentSettings).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onDownloaded).toHaveBeenCalledWith({
      filename: 'foo-123.xml',
      data: downloadedData,
    });
    expect(onDownloadError).not.toHaveBeenCalled();
  });

  test('should call onDownloadError when downloading an entity fails', async () => {
    const currentSettings = testing
      .fn()
      .mockResolvedValue(currentSettingsResponse);
    const error = new Error('error');
    const entity = new Model({id: '123'});
    const onDownloaded = testing.fn();
    const onDownloadError = testing.fn();

    const gmp = {
      foo: {export: testing.fn().mockRejectedValue(error)},
      user: {currentSettings},
    };
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
