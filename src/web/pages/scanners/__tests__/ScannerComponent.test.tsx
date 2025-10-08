/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, fireEvent, rendererWith, wait} from 'web/testing';
import Filter from 'gmp/models/filter';
import Scanner, {
  GREENBONE_SENSOR_SCANNER_TYPE,
  OPENVASD_SCANNER_TYPE,
} from 'gmp/models/scanner';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import ScannerComponent from 'web/pages/scanners/ScannerComponent';

const createGmp = (object?: unknown) => {
  const gmp = {
    settings: {
      enableGreenboneSensor: true,
    },
    user: {
      currentSettings: testing
        .fn()
        .mockResolvedValue(currentSettingsDefaultResponse),
    },
  };
  // @ts-expect-error
  return {...gmp, ...object};
};

describe('ScannerComponent tests', () => {
  test('should allow to clone a scanner', async () => {
    const scanner = new Scanner({
      id: '1234',
      name: 'Test Scanner',
      host: 'http://scanner-host',
      port: 443,
      scannerType: OPENVASD_SCANNER_TYPE,
    });
    const cloneScanner = testing.fn().mockResolvedValue(scanner);
    const gmp = createGmp({
      scanner: {
        clone: cloneScanner,
      },
    });
    const handleCloned = testing.fn();
    const handleCloneError = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp, store: true});
    render(
      <ScannerComponent onCloneError={handleCloneError} onCloned={handleCloned}>
        {({clone}) => <button onClick={() => clone(scanner)}></button>}
      </ScannerComponent>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(cloneScanner).toHaveBeenCalledWith(scanner);

    await wait();

    expect(handleCloned).toHaveBeenCalledWith(scanner);
    expect(handleCloneError).not.toHaveBeenCalled();
  });

  test('should handle error on cloning a scanner', async () => {
    const scanner = new Scanner({
      id: '1234',
      name: 'Test Scanner',
      host: 'http://scanner-host',
      port: 443,
      scannerType: OPENVASD_SCANNER_TYPE,
    });
    const error = new Error('Clone error');
    const cloneScanner = testing.fn().mockRejectedValue(error);
    const gmp = createGmp({
      scanner: {
        clone: cloneScanner,
      },
    });
    const handleCloned = testing.fn();
    const handleCloneError = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp, store: true});
    render(
      <ScannerComponent onCloneError={handleCloneError} onCloned={handleCloned}>
        {({clone}) => (
          <button aria-label="clone" onClick={() => clone(scanner)}></button>
        )}
      </ScannerComponent>,
    );

    const button = screen.getByRole('button', {name: 'clone'});
    fireEvent.click(button);
    expect(cloneScanner).toHaveBeenCalledWith(scanner);

    await wait();

    expect(handleCloneError).toHaveBeenCalledWith(error);
    expect(handleCloned).not.toHaveBeenCalled();
  });

  test('should allow to delete a scanner', async () => {
    const scanner = new Scanner({
      id: '1234',
      name: 'Test Scanner',
      host: 'http://scanner-host',
      port: 443,
      scannerType: OPENVASD_SCANNER_TYPE,
    });
    const deleteScanner = testing.fn().mockResolvedValue(undefined);
    const gmp = createGmp({
      scanner: {
        delete: deleteScanner,
      },
    });
    const handleDeleted = testing.fn();
    const handleDeleteError = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp, store: true});
    render(
      <ScannerComponent
        onDeleteError={handleDeleteError}
        onDeleted={handleDeleted}
      >
        {({delete: remove}) => (
          <button aria-label="delete" onClick={() => remove(scanner)}></button>
        )}
      </ScannerComponent>,
    );

    const button = screen.getByRole('button', {name: 'delete'});
    fireEvent.click(button);
    expect(deleteScanner).toHaveBeenCalledWith({id: '1234'});

    await wait();

    expect(handleDeleted).toHaveBeenCalledWith(undefined);
    expect(handleDeleteError).not.toHaveBeenCalled();
  });

  test('should handle error on deleting a scanner', async () => {
    const scanner = new Scanner({
      id: '1234',
      name: 'Test Scanner',
      host: 'http://scanner-host',
      port: 443,
      scannerType: OPENVASD_SCANNER_TYPE,
    });
    const error = new Error('Delete error');
    const deleteScanner = testing.fn().mockRejectedValue(error);
    const gmp = createGmp({
      scanner: {
        delete: deleteScanner,
      },
    });
    const handleDeleted = testing.fn();
    const handleDeleteError = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp, store: true});
    render(
      <ScannerComponent
        onDeleteError={handleDeleteError}
        onDeleted={handleDeleted}
      >
        {({delete: remove}) => (
          <button aria-label="delete" onClick={() => remove(scanner)}></button>
        )}
      </ScannerComponent>,
    );

    const button = screen.getByRole('button', {name: 'delete'});
    fireEvent.click(button);
    expect(deleteScanner).toHaveBeenCalledWith({id: '1234'});

    await wait();

    expect(handleDeleteError).toHaveBeenCalledWith(error);
    expect(handleDeleted).not.toHaveBeenCalled();
  });

  test('should allow to edit a scanner', async () => {
    const scanner = new Scanner({
      id: '1234',
      name: 'Test Scanner',
      host: 'http://scanner-host',
      port: 443,
      scannerType: OPENVASD_SCANNER_TYPE,
    });
    const gmp = createGmp({
      scanner: {
        get: testing.fn().mockResolvedValue({data: scanner}),
        save: testing.fn().mockResolvedValue(scanner),
      },
      credentials: {
        getAll: testing.fn().mockResolvedValue([]),
      },
    });
    const handleEdited = testing.fn();
    const handleEditError = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp, store: true});
    render(
      <ScannerComponent onSaveError={handleEditError} onSaved={handleEdited}>
        {({edit}) => (
          <button aria-label="edit" onClick={() => edit(scanner)}></button>
        )}
      </ScannerComponent>,
    );

    const button = screen.getByRole('button', {name: 'edit'});
    fireEvent.click(button);
    expect(gmp.scanner.get).toHaveBeenCalledWith({id: '1234'});
    expect(gmp.credentials.getAll).toHaveBeenCalledWith({
      filter: Filter.fromString('type=cc'),
    });

    await wait();

    expect(screen.getDialog()).toBeInTheDocument();
    fireEvent.click(screen.getDialogSaveButton());

    await wait();

    expect(handleEdited).toHaveBeenCalledWith(scanner);
    expect(handleEditError).not.toHaveBeenCalled();
  });

  test('should allow to create a new scanner', async () => {
    const gmp = createGmp({
      scanner: {
        create: testing.fn().mockResolvedValue({
          id: '1234',
        }),
      },
      credentials: {
        getAll: testing.fn().mockResolvedValue([]),
      },
    });
    const handleCreated = testing.fn();
    const handleCreateError = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp, store: true});
    render(
      <ScannerComponent
        onCreateError={handleCreateError}
        onCreated={handleCreated}
      >
        {({create}) => (
          <button aria-label="create" onClick={() => create()}></button>
        )}
      </ScannerComponent>,
    );

    const button = screen.getByRole('button', {name: 'create'});
    fireEvent.click(button);

    await wait();

    expect(screen.getDialog()).toBeInTheDocument();
    fireEvent.click(screen.getDialogSaveButton());

    await wait();

    expect(gmp.scanner.create).toHaveBeenCalledWith({
      comment: '',
      credentialId: undefined,
      host: 'localhost',
      id: undefined,
      name: 'Unnamed',
      port: undefined,
      type: GREENBONE_SENSOR_SCANNER_TYPE,
    });
    expect(handleCreated).toHaveBeenCalledWith({id: '1234'});
    expect(handleCreateError).not.toHaveBeenCalled();
  });

  test('should handle error on creating a new scanner', async () => {
    const error = new Error('Create error');
    const gmp = createGmp({
      scanner: {
        create: testing.fn().mockRejectedValue(error),
      },
      credentials: {
        getAll: testing.fn().mockResolvedValue([]),
      },
    });
    const handleCreated = testing.fn();
    const handleCreateError = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp, store: true});
    render(
      <ScannerComponent
        onCreateError={handleCreateError}
        onCreated={handleCreated}
      >
        {({create}) => (
          <button aria-label="create" onClick={() => create()}></button>
        )}
      </ScannerComponent>,
    );

    const button = screen.getByRole('button', {name: 'create'});
    fireEvent.click(button);

    await wait();

    expect(screen.getDialog()).toBeInTheDocument();
    fireEvent.click(screen.getDialogSaveButton());

    await wait();

    expect(gmp.scanner.create).toHaveBeenCalled();
    expect(handleCreateError).toHaveBeenCalledWith(error);
    expect(handleCreated).not.toHaveBeenCalled();
  });
});
