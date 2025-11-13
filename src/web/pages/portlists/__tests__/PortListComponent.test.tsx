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
import PortList from 'gmp/models/port-list';
import Button from 'web/components/form/Button';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/current-settings';
import PortListComponent from 'web/pages/portlists/PortListComponent';

const defaultGetPortListResponse = {
  data: PortList.fromElement({id: '123', name: 'foo'}),
};
const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);
const createGmp = ({
  getPortListResponse = defaultGetPortListResponse,
  createPortListResponse = {id: '123'},
  deletePortListResponse = undefined,
  savePortListResponse = {id: '123'},
  clonePortListResponse = {id: '123'},
  createPortRangeResponse = {id: '1234'},
  getPortList = testing.fn().mockResolvedValue(getPortListResponse),
  createPortList = testing.fn().mockResolvedValue(createPortListResponse),
  deletePortList = testing.fn().mockResolvedValue(deletePortListResponse),
  savePortList = testing.fn().mockResolvedValue(savePortListResponse),
  clonePortList = testing.fn().mockResolvedValue(clonePortListResponse),
  createPortRange = testing
    .fn()
    .mockResolvedValue({data: createPortRangeResponse}),
  deletePortRange = testing.fn().mockResolvedValue(undefined),
} = {}) => {
  return {
    portlist: {
      get: getPortList,
      create: createPortList,
      delete: deletePortList,
      save: savePortList,
      clone: clonePortList,
      createPortRange,
      deletePortRange,
    },
    user: {currentSettings},
  };
};

describe('PortListComponent tests', () => {
  test('should render without crashing', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp});
    render(
      <PortListComponent>{() => <div>Some Content</div>}</PortListComponent>,
    );
    await wait();
    expect(screen.getByText('Some Content')).toBeInTheDocument();
  });

  test('should open and close PortListDialog', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp});
    render(
      <PortListComponent>
        {({create}) => <Button data-testid="open" onClick={create} />}
      </PortListComponent>,
    );

    await wait();

    fireEvent.click(screen.getByTestId('open'));
    expect(screen.getByText('New Port List')).toBeInTheDocument();

    const cancelButton = screen.getDialogCloseButton();
    fireEvent.click(cancelButton);
    expect(screen.queryByText('New Port List')).not.toBeInTheDocument();
  });

  test('should open and close ImportPortListDialog', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp});
    render(
      <PortListComponent>
        {({import: openImport}) => (
          <Button data-testid="import" onClick={openImport} />
        )}
      </PortListComponent>,
    );

    await wait();
    fireEvent.click(screen.getByTestId('import'));
    expect(screen.getByText('Import Port List')).toBeInTheDocument();

    const cancelButton = screen.getDialogCloseButton();
    fireEvent.click(cancelButton);
    expect(screen.queryByText('Import Port List')).not.toBeInTheDocument();
  });

  test('should open and close PortRangeDialog', async () => {
    const gmp = createGmp();
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
    const gmp = createGmp();
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
    expect(onCreateError).not.toHaveBeenCalled();
    expect(onCreated).toHaveBeenCalledWith({id: '123'});
  });

  test('should call onCreateError if creating a new port list fails', async () => {
    const error = new Error('error');
    const gmp = createGmp({
      createPortList: testing.fn().mockRejectedValue(error),
    });
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
    expect(onCreateError).toHaveBeenCalledWith(error);
    expect(onCreated).not.toHaveBeenCalled();
  });

  test('should show error in dialog if creating a new port list fails', async () => {
    const error = new Error('some error');
    const gmp = createGmp({
      createPortList: testing.fn().mockRejectedValue(error),
    });
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
    const gmp = createGmp();
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
    expect(onSaveError).not.toHaveBeenCalled();
    expect(onSaved).toHaveBeenCalledWith({id: '123'});
  });

  test('should allow editing a port list to add a port range', async () => {
    const gmp = createGmp();
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
    expect(gmp.portlist.createPortRange).toHaveBeenCalledExactlyOnceWith({
      portListId: '123',
      portRangeEnd: 20,
      portRangeStart: 1,
      portType: 'tcp',
    });
    expect(gmp.portlist.save).toHaveBeenCalledExactlyOnceWith({
      comment: '',
      id: '123',
      name: 'foo',
    });
    expect(onSaveError).not.toHaveBeenCalled();
    expect(onSaved).toHaveBeenCalledExactlyOnceWith({id: '123'});
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
    const deletePortRange = testing.fn().mockResolvedValue(portListResponse);
    const gmp = createGmp({
      getPortListResponse: portListResponse,
      deletePortRange,
    });
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
    expect(gmp.portlist.save).toHaveBeenCalledExactlyOnceWith({
      comment: '',
      id: '123',
      name: 'foo',
    });
    expect(onSaved).toHaveBeenCalledExactlyOnceWith({id: '123'});
    expect(screen.queryByText('Edit Port List foo')).not.toBeInTheDocument();
  });

  test('should call onSaveError if saving a port list fails', async () => {
    const portList = PortList.fromElement({id: '123', name: 'foo'});
    const portListResponse = {data: portList};
    const error = new Error('error');
    const gmp = createGmp({
      getPortListResponse: portListResponse,
      savePortList: testing.fn().mockRejectedValue(error),
    });
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
    const gmp = createGmp({
      getPortListResponse: portListResponse,
      savePortList: testing.fn().mockRejectedValue(error),
    });

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
    const gmp = createGmp();
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
    expect(onCloneError).not.toHaveBeenCalled();
    expect(onCloned).toHaveBeenCalledExactlyOnceWith({id: '123'});
  });

  test('should call onCloneError when cloning a port list fails', async () => {
    const error = new Error('error');
    const onCloned = testing.fn();
    const onCloneError = testing.fn();
    const gmp = createGmp({
      clonePortList: testing.fn().mockRejectedValue(error),
    });
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
    expect(onCloned).not.toHaveBeenCalled();
    expect(onCloneError).toHaveBeenCalledExactlyOnceWith(error);
  });

  test('should allow deleting a port list', async () => {
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();
    const gmp = createGmp();
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
    expect(onDeleteError).not.toHaveBeenCalled();
    expect(onDeleted).toHaveBeenCalledOnce();
  });

  test('should call onDeleteError when deleting a port list fails', async () => {
    const error = new Error('error');
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();
    const gmp = createGmp({
      deletePortList: testing.fn().mockRejectedValue(error),
    });
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
    expect(onDeleted).not.toHaveBeenCalled();
    expect(onDeleteError).toHaveBeenCalledExactlyOnceWith(error);
  });
});
