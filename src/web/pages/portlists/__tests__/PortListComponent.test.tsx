/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  changeInputValue,
  screen,
  within,
  rendererWith,
  wait,
  fireEvent,
} from 'web/testing';
import PortList from 'gmp/models/portlist';
import Button from 'web/components/form/Button';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import PortListComponent from 'web/pages/portlists/PortListComponent';

const getPortListResponse = {
  data: PortList.fromElement({id: '123', name: 'foo'}),
};
const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);
const getPortList = testing.fn().mockResolvedValue(getPortListResponse);

describe('PortListComponent tests', () => {
  test('should render without crashing', () => {
    const gmp = {
      portlist: {
        get: getPortList,
      },
      user: {currentSettings},
    };

    const {render} = rendererWith({gmp});
    render(
      <PortListComponent>{() => <div>Some Content</div>}</PortListComponent>,
    );
    expect(screen.getByText('Some Content')).toBeInTheDocument();
  });

  test('should open and close PortListDialog', () => {
    const gmp = {
      portlist: {
        get: getPortList,
      },
      user: {currentSettings},
    };

    const {render} = rendererWith({gmp});
    render(
      <PortListComponent>
        {({create}) => <Button data-testid="open" onClick={create} />}
      </PortListComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    expect(screen.getByText('New Port List')).toBeInTheDocument();

    const cancelButton = screen.getDialogCloseButton();
    fireEvent.click(cancelButton);
    expect(screen.queryByText('New Port List')).not.toBeInTheDocument();
  });

  test('should open and close ImportPortListDialog', () => {
    const gmp = {
      portlist: {
        get: getPortList,
      },
      user: {currentSettings},
    };

    const {render} = rendererWith({gmp});
    render(
      <PortListComponent>
        {({import: openImport}) => (
          <Button data-testid="import" onClick={openImport} />
        )}
      </PortListComponent>,
    );

    fireEvent.click(screen.getByTestId('import'));
    expect(screen.getByText('Import Port List')).toBeInTheDocument();

    const cancelButton = screen.getDialogCloseButton();
    fireEvent.click(cancelButton);
    expect(screen.queryByText('Import Port List')).not.toBeInTheDocument();
  });

  test('should open and close PortRangeDialog', async () => {
    const gmp = {
      portlist: {
        get: getPortList,
      },
      user: {currentSettings},
    };

    const {render} = rendererWith({gmp});
    render(
      <PortListComponent>
        {({edit}) => (
          <Button
            data-testid="edit"
            onClick={() => edit(new PortList({id: '123'}))}
          />
        )}
      </PortListComponent>,
    );

    fireEvent.click(screen.getByTestId('edit'));
    await wait();
    expect(screen.getByText('Edit Port List foo')).toBeInTheDocument();

    const newPortRangeIcon = screen.getByTestId('new-port-range');
    fireEvent.click(newPortRangeIcon);
    expect(screen.getByText('New Port Range')).toBeInTheDocument();

    const portRangeDialog = within(screen.queryDialogs()[1]);
    const cancelPortRangeButton = portRangeDialog.getDialogCloseButton();
    fireEvent.click(cancelPortRangeButton);
    expect(screen.queryByText('New Port Range')).not.toBeInTheDocument();

    const cancelPortListButton = screen.getDialogCloseButton();
    fireEvent.click(cancelPortListButton);
    expect(screen.queryByText('Edit Port List foo')).not.toBeInTheDocument();
  });

  test('should allow creating a new port list', async () => {
    const newPortList = PortList.fromElement({id: '123'});
    const gmp = {
      portlist: {
        create: testing.fn().mockResolvedValue(newPortList),
      },
      user: {currentSettings},
    };

    const onCreated = testing.fn();
    const onCreateError = testing.fn();
    const {render} = rendererWith({gmp});
    render(
      <PortListComponent onCreateError={onCreateError} onCreated={onCreated}>
        {({create}) => <Button data-testid="open" onClick={create} />}
      </PortListComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    expect(screen.getByText('New Port List')).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();

    expect(screen.queryByText('New Port List')).not.toBeInTheDocument();
    expect(onCreated).toHaveBeenCalledWith(newPortList);
    expect(onCreateError).not.toHaveBeenCalled();
  });

  test('should call onCreateError if creating a new port list fails', async () => {
    const error = new Error('error');
    const gmp = {
      portlist: {
        create: testing.fn().mockRejectedValue(error),
      },
      user: {currentSettings},
    };

    const onCreated = testing.fn();
    const onCreateError = testing.fn();
    const {render} = rendererWith({gmp});
    render(
      <PortListComponent onCreateError={onCreateError} onCreated={onCreated}>
        {({create}) => <Button data-testid="open" onClick={create} />}
      </PortListComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await wait();
    expect(screen.getByText('New Port List')).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();
    expect(screen.queryByText('New Port List')).not.toBeInTheDocument();
    expect(onCreated).not.toHaveBeenCalled();
    expect(onCreateError).toHaveBeenCalledWith(error);
  });

  test('should show error in dialog if creating a new port list fails', async () => {
    const error = new Error('some error');
    const gmp = {
      portlist: {
        create: testing.fn().mockRejectedValue(error),
      },
      user: {currentSettings},
    };

    const onCreated = testing.fn();
    const {render} = rendererWith({gmp});
    render(
      <PortListComponent onCreated={onCreated}>
        {({create}) => <Button data-testid="open" onClick={create} />}
      </PortListComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await wait();
    expect(screen.getByText('New Port List')).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();
    screen.getByText('New Port List');
    screen.getByText('some error');
    expect(onCreated).not.toHaveBeenCalled();
  });

  test('should allow editing a port list', async () => {
    const portList = PortList.fromElement({id: '123', name: 'foo'});
    const portListResponse = {data: portList};
    const gmp = {
      portlist: {
        get: testing.fn().mockResolvedValue(portListResponse),
        save: testing.fn().mockResolvedValue(portList),
      },
      user: {currentSettings},
    };

    const onSaved = testing.fn();
    const onSaveError = testing.fn();
    const {render} = rendererWith({gmp});
    render(
      <PortListComponent onSaveError={onSaveError} onSaved={onSaved}>
        {({edit}) => (
          <Button
            data-testid="open"
            onClick={() => edit(new PortList({id: '123'}))}
          />
        )}
      </PortListComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await wait();
    expect(screen.getByText('Edit Port List foo')).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();
    expect(screen.queryByText('Edit Port List foo')).not.toBeInTheDocument();
    expect(onSaved).toHaveBeenCalledWith(portList);
    expect(onSaveError).not.toHaveBeenCalled();
  });

  test('should allow editing a port list to add a port range', async () => {
    const portList = PortList.fromElement({id: '123', name: 'foo'});
    const portListResponse = {data: portList};
    const createPortRange = testing.fn().mockResolvedValue({data: {id: 1234}});
    const save = testing.fn().mockResolvedValue(portList);
    const gmp = {
      portlist: {
        get: testing.fn().mockResolvedValue(portListResponse),
        save,
        createPortRange,
      },
      user: {currentSettings},
    };

    const onSaved = testing.fn();
    const onSaveError = testing.fn();
    const {render} = rendererWith({gmp});
    render(
      <PortListComponent onSaveError={onSaveError} onSaved={onSaved}>
        {({edit}) => (
          <Button
            data-testid="open"
            onClick={() => edit(new PortList({id: '123'}))}
          />
        )}
      </PortListComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await wait();
    expect(screen.getByText('Edit Port List foo')).toBeInTheDocument();

    const openPortRangeDialog = screen.getByTestId('new-port-range');
    fireEvent.click(openPortRangeDialog);
    await wait();
    expect(screen.getByText('New Port Range')).toBeInTheDocument();
    const dialogs = screen.queryDialogs();
    const portListDialog = within(dialogs[0]);
    const portRangeDialog = within(dialogs[1]);

    const portRangeStart = portRangeDialog.getByName('portRangeStart');
    changeInputValue(portRangeStart, '1');

    const portRangeEnd = portRangeDialog.getByName('portRangeEnd');
    changeInputValue(portRangeEnd, '20');

    const savePortRangeButton = portRangeDialog.getDialogSaveButton();
    fireEvent.click(savePortRangeButton);
    await wait();
    expect(screen.queryByText('New Port Range')).not.toBeInTheDocument();

    const savePortListButton = portListDialog.getDialogSaveButton();
    fireEvent.click(savePortListButton);
    await wait();
    expect(createPortRange).toHaveBeenCalledExactlyOnceWith({
      portListId: '123',
      portRangeEnd: 20,
      portRangeStart: 1,
      portType: 'tcp',
    });
    expect(save).toHaveBeenCalledExactlyOnceWith({
      comment: '',
      fromFile: 0,
      id: '123',
      name: 'foo',
      portRange: 'T:1-5,7,9,U:1-3,5,7,9',
      portRanges: [
        {
          end: 20,
          id: 1234,
          start: 1,
          isTmp: false,
          portListId: '123',
          protocolType: 'tcp',
        },
      ],
    });
    expect(onSaved).toHaveBeenCalledExactlyOnceWith(portList);
    expect(onSaveError).not.toHaveBeenCalled();
    expect(screen.queryByText('Edit Port List foo')).not.toBeInTheDocument();
  });

  test('should allow editing a port list and delete a port range', async () => {
    const portList = PortList.fromElement({
      id: '123',
      name: 'foo',
      port_ranges: {
        port_range: [
          {
            id: '123',
            start: 1,
            end: 2,
            type: 'tcp',
            comment: 'foo',
          },
        ],
      },
    });
    const portListResponse = {data: portList};
    const save = testing.fn().mockResolvedValue(portList);
    const deletePortRange = testing.fn().mockResolvedValue(portListResponse);
    const gmp = {
      portlist: {
        get: testing.fn().mockResolvedValue(portListResponse),
        save,
        deletePortRange,
      },
      user: {currentSettings},
    };

    const onSaved = testing.fn();
    const onSaveError = testing.fn();
    const {render} = rendererWith({gmp});
    render(
      <PortListComponent onSaveError={onSaveError} onSaved={onSaved}>
        {({edit}) => (
          <Button
            data-testid="open"
            onClick={() => edit(new PortList({id: '123'}))}
          />
        )}
      </PortListComponent>,
    );
    fireEvent.click(screen.getByTestId('open'));
    await wait();
    expect(screen.getByText('Edit Port List foo')).toBeInTheDocument();

    const deletePortRangeIcon = screen.queryAllByTestId('delete-icon')[0];
    fireEvent.click(deletePortRangeIcon);

    const savePortListButton = screen.getDialogSaveButton();
    fireEvent.click(savePortListButton);
    await wait();

    expect(deletePortRange).toHaveBeenCalledExactlyOnceWith({
      id: portList.portRanges[0].id,
      portListId: portList.id,
    });
    expect(onSaveError).not.toHaveBeenCalled();
    expect(save).toHaveBeenCalledExactlyOnceWith({
      comment: '',
      fromFile: 0,
      id: '123',
      name: 'foo',
      portRange: 'T:1-5,7,9,U:1-3,5,7,9',
      portRanges: [],
    });
    expect(onSaved).toHaveBeenCalledExactlyOnceWith(portList);
    expect(screen.queryByText('Edit Port List foo')).not.toBeInTheDocument();
  });

  test('should call onSaveError if saving a port list fails', async () => {
    const portList = PortList.fromElement({id: '123', name: 'foo'});
    const portListResponse = {data: portList};
    const error = new Error('error');
    const gmp = {
      portlist: {
        get: testing.fn().mockResolvedValue(portListResponse),
        save: testing.fn().mockRejectedValue(error),
      },
      user: {currentSettings},
    };

    const onSaved = testing.fn();
    const onSaveError = testing.fn();
    const {render} = rendererWith({gmp});
    render(
      <PortListComponent onSaveError={onSaveError} onSaved={onSaved}>
        {({edit}) => (
          <Button
            data-testid="open"
            onClick={() => edit(new PortList({id: '123'}))}
          />
        )}
      </PortListComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await wait();
    expect(screen.getByText('Edit Port List foo')).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();

    expect(screen.queryByText('Edit Port List foo')).not.toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
    expect(onSaveError).toHaveBeenCalledExactlyOnceWith(error);
  });

  test('should show error in dialog if saving a port list fails', async () => {
    const portList = PortList.fromElement({id: '123', name: 'foo'});
    const portListResponse = {data: portList};
    const error = new Error('some error');
    const gmp = {
      portlist: {
        get: testing.fn().mockResolvedValue(portListResponse),
        save: testing.fn().mockRejectedValue(error),
      },
      user: {currentSettings},
    };

    const onSaved = testing.fn();
    const {render} = rendererWith({gmp});
    render(
      <PortListComponent onSaved={onSaved}>
        {({edit}) => (
          <Button
            data-testid="open"
            onClick={() => edit(new PortList({id: '123'}))}
          />
        )}
      </PortListComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await wait();
    screen.getByText('Edit Port List foo');

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();

    screen.getByText('Edit Port List foo');
    screen.getByText('some error');
    expect(onSaved).not.toHaveBeenCalled();
  });

  test('should allow cloning a port list', async () => {
    const cloned = PortList.fromElement({id: '123'});
    const gmp = {
      portlist: {
        clone: testing.fn().mockResolvedValue(cloned),
      },
      user: {currentSettings},
    };
    const onCloned = testing.fn();
    const onCloneError = testing.fn();

    const {render} = rendererWith({gmp});
    render(
      <PortListComponent onCloneError={onCloneError} onCloned={onCloned}>
        {({clone}) => (
          <Button
            data-testid="button"
            onClick={() => clone(new PortList({id: '123'}))}
          />
        )}
      </PortListComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onCloned).toHaveBeenCalledExactlyOnceWith(cloned);
    expect(onCloneError).not.toHaveBeenCalled();
  });

  test('should call onCloneError when cloning a port list fails', async () => {
    const error = new Error('error');
    const onCloned = testing.fn();
    const onCloneError = testing.fn();

    const gmp = {
      portlist: {
        clone: testing.fn().mockRejectedValue(error),
      },
      user: {currentSettings},
    };
    const {render} = rendererWith({gmp});
    render(
      <PortListComponent onCloneError={onCloneError} onCloned={onCloned}>
        {({clone}) => (
          <Button
            data-testid="button"
            onClick={() => clone(new PortList({id: '123'}))}
          />
        )}
      </PortListComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onCloneError).toHaveBeenCalledExactlyOnceWith(error);
    expect(onCloned).not.toHaveBeenCalled();
  });

  test('should allow deleting a port list', async () => {
    const deleted = {id: '123'};
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();

    const gmp = {
      portlist: {
        delete: testing.fn().mockResolvedValue(deleted),
      },
      user: {currentSettings},
    };
    const {render} = rendererWith({gmp});
    render(
      <PortListComponent onDeleteError={onDeleteError} onDeleted={onDeleted}>
        {({delete: del}) => (
          <Button
            data-testid="button"
            onClick={() => del(new PortList({id: '123'}))}
          />
        )}
      </PortListComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onDeleted).toHaveBeenCalledOnce();
    expect(onDeleteError).not.toHaveBeenCalled();
  });

  test('should call onDeleteError when deleting a port list fails', async () => {
    const error = new Error('error');
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();

    const gmp = {
      portlist: {delete: testing.fn().mockRejectedValue(error)},
      user: {currentSettings},
    };
    const {render} = rendererWith({gmp});
    render(
      <PortListComponent onDeleteError={onDeleteError} onDeleted={onDeleted}>
        {({delete: del}) => (
          <Button
            data-testid="button"
            onClick={() => del(new PortList({id: '123'}))}
          />
        )}
      </PortListComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onDeleteError).toHaveBeenCalledExactlyOnceWith(error);
    expect(onDeleted).not.toHaveBeenCalled();
  });
});
