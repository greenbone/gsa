/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  fireEvent,
  rendererWith,
  screen,
  userEvent,
  wait,
  waitFor,
  within,
} from 'web/testing';
import {createActionResultResponse} from 'gmp/commands/testing';
import Response from 'gmp/http/response';
import type Model from 'gmp/models/model';
import Setting from 'gmp/models/setting';
import Target, {SCAN_CONFIG_DEFAULT} from 'gmp/models/target';
import {createSession} from 'gmp/testing';
import Button from 'web/components/form/Button';
import TargetComponent from 'web/pages/targets/TargetComponent';
import {DEFAULT_PORT_LIST_ID} from 'web/pages/targets/TargetDialog';

type CreateGmpParams = {
  credentials?: Model[];
  portlists?: Model[];
  create?: ReturnType<typeof testing.fn>;
  save?: ReturnType<typeof testing.fn>;
  clone?: ReturnType<typeof testing.fn>;
  delete?: ReturnType<typeof testing.fn>;
  createCredential?: ReturnType<typeof testing.fn>;
  createPortList?: ReturnType<typeof testing.fn>;
};

const createGmp = ({
  credentials = [],
  portlists = [],
  create = testing
    .fn()
    .mockResolvedValue(createActionResultResponse({id: 'new-id'})),
  save = testing
    .fn()
    .mockResolvedValue(createActionResultResponse({id: 'saved-id'})),
  clone = testing
    .fn()
    .mockResolvedValue(createActionResultResponse({id: 'cloned-id'})),
  delete: deleteTarget = testing.fn().mockResolvedValue(undefined),
  createCredential = testing.fn().mockResolvedValue({data: {id: 'cred-id'}}),
  createPortList = testing.fn().mockResolvedValue({data: {id: 'port-list-id'}}),
}: CreateGmpParams = {}) => {
  return {
    settings: {
      enableGreenboneSensor: true,
      enableKrb5: false,
    },
    session: createSession({token: 'test-token'}),
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
      getSetting: testing.fn().mockResolvedValue({data: {value: '%T-%U'}}),
    },
    credential: {
      create: createCredential,
    },
    portlist: {
      create: createPortList,
    },
    credentials: {
      getAll: testing.fn().mockResolvedValue(new Response(credentials)),
    },
    portlists: {
      getAll: testing.fn().mockResolvedValue(new Response(portlists)),
    },
    target: {
      create,
      save,
      clone,
      delete: deleteTarget,
      export: testing.fn().mockResolvedValue(new Response('some-data')),
    },
  };
};

describe('TargetComponent tests', () => {
  test('should prefill hosts only for new target creation without saving', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, capabilities: true});
    render(
      <TargetComponent>
        {({create}) => (
          <Button
            title="Create from AD"
            onClick={() =>
              create({
                hosts: ['pc-042.domain.local', 'fs-01.domain.local'],
                source: 'active_directory',
                targetSource: 'manual',
              })
            }
          />
        )}
      </TargetComponent>,
    );
    fireEvent.click(screen.getByRole('button', {name: 'Create from AD'}));
    await wait();
    expect(within(screen.getDialog()).getByName('hosts')).toHaveValue(
      'pc-042.domain.local,fs-01.domain.local',
    );
    expect(gmp.target.create).not.toHaveBeenCalled();
  });

  test.each([
    ['prefilled hosts', 'manual', 'active_directory'],
    ['edited hosts', 'manual', 'active_directory'],
    ['file input', 'file', undefined],
    ['asset filter', 'asset_hosts', undefined],
  ] as const)(
    'records the source when saving %s',
    async (scenario, mode, source) => {
      const gmp = createGmp();
      const {render} = rendererWith({gmp, capabilities: true});
      render(
        <TargetComponent>
          {({create}) => (
            <Button
              title="Create from AD"
              onClick={() =>
                create({
                  hosts: ['pc-042.domain.local'],
                  hostsCount: 2,
                  source: 'active_directory',
                  targetSource: 'manual',
                })
              }
            />
          )}
        </TargetComponent>,
      );
      fireEvent.click(screen.getByRole('button', {name: 'Create from AD'}));
      const dialog = within(await screen.findByRole('dialog'));
      if (scenario === 'edited hosts') {
        const user = userEvent.setup();
        await user.type(
          dialog.getAllByTestId('form-multi-input')[0],
          'pc-043.domain.local{Enter}',
        );
      } else if (mode === 'file') {
        fireEvent.click(dialog.getAllByName('targetSource')[1]);
        fireEvent.change(dialog.getByName('file'), {
          target: {files: [new File(['pc-043.domain.local'], 'hosts.txt')]},
        });
      } else if (mode === 'asset_hosts') {
        fireEvent.click(
          dialog.getByRole('radio', {name: 'From host assets (2 hosts)'}),
        );
      }
      fireEvent.click(screen.getDialogSaveButton());
      await waitFor(() => expect(gmp.target.create).toHaveBeenCalledTimes(1));
      const [data] = gmp.target.create.mock.calls[0];
      expect(data.targetSource).toBe(mode);
      if (scenario === 'edited hosts')
        expect(data.hosts).toEqual([
          'pc-042.domain.local',
          'pc-043.domain.local',
        ]);
      if (mode === 'file')
        expect(data.file).toHaveProperty('name', 'hosts.txt');
      if (source) expect(data.source).toBe(source);
      else expect(data).not.toHaveProperty('source');
    },
  );

  test('should render', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    render(
      <TargetComponent>
        {() => <Button data-testid="button" />}
      </TargetComponent>,
    );

    expect(screen.getByTestId('button')).toBeInTheDocument();
  });

  test('should allow to create a new target', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, capabilities: true});
    const onCreated = testing.fn();

    render(
      <TargetComponent onCreated={onCreated}>
        {({create}) => <Button data-testid="button" onClick={() => create()} />}
      </TargetComponent>,
    );

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    await wait();

    expect(screen.getDialog()).toBeInTheDocument();
    await wait();
    fireEvent.click(screen.getDialogSaveButton());
    await wait();

    expect(gmp.target.create).toHaveBeenCalledWith({
      aliveTests: [SCAN_CONFIG_DEFAULT],
      allowSimultaneousIPs: true,
      comment: '',
      esxiCredentialId: undefined,
      excludeHosts: [],
      hosts: [],
      hostsCount: undefined,
      hostsFilter: undefined,
      id: undefined,
      inUse: false,
      krb5CredentialId: undefined,
      name: 'Unnamed',
      port: 22,
      portListId: DEFAULT_PORT_LIST_ID,
      reverseLookupOnly: false,
      reverseLookupUnify: false,
      smbCredentialId: undefined,
      snmpCredentialId: undefined,
      sshCredentialId: undefined,
      sshElevateCredentialId: undefined,
      targetExcludeSource: 'manual',
      targetSource: 'manual',
    });

    await wait();

    expect(onCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        envelope: {
          action_result: expect.objectContaining({
            id: 'new-id',
          }),
        },
      }),
    );
  });

  test('should report target creation errors', async () => {
    const error = new Error('Create failed');
    const create = testing.fn().mockRejectedValue(error);
    const gmp = createGmp({create});
    const onCreateError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <TargetComponent onCreateError={onCreateError}>
        {({create: openCreate}) => (
          <Button data-testid="open" onClick={() => openCreate()} />
        )}
      </TargetComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await wait();
    await wait();
    fireEvent.click(screen.getDialogSaveButton());
    await wait();

    expect(onCreateError.mock.calls[0][0]).toBe(error);
  });

  test('should allow to edit an existing target', async () => {
    const gmp = createGmp();
    const target = new Target({
      name: 'My Target',
      id: '1234',
      hosts: ['192.168.1.1', '192.168.1.2'],
      excludeHosts: ['192.168.1.3'],
    });
    const onSaved = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <TargetComponent onSaved={onSaved}>
        {({edit}) => (
          <Button data-testid="button" onClick={() => edit(target)} />
        )}
      </TargetComponent>,
    );

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    await wait();

    expect(screen.getDialog()).toBeInTheDocument();
    await wait();
    fireEvent.click(screen.getDialogSaveButton());
    await wait();

    expect(gmp.target.save).toHaveBeenCalledWith({
      aliveTests: [],
      allowSimultaneousIPs: false,
      comment: '',
      esxiCredentialId: undefined,
      excludeHosts: ['192.168.1.3'],
      hosts: ['192.168.1.1', '192.168.1.2'],
      hostsCount: undefined,
      hostsFilter: undefined,
      id: '1234',
      inUse: false,
      krb5CredentialId: undefined,
      name: 'My Target',
      port: 22,
      portListId: DEFAULT_PORT_LIST_ID,
      reverseLookupOnly: false,
      reverseLookupUnify: false,
      smbCredentialId: undefined,
      snmpCredentialId: undefined,
      sshCredentialId: undefined,
      sshElevateCredentialId: undefined,
      targetExcludeSource: 'manual',
      targetSource: 'manual',
    });

    await wait();

    expect(onSaved).toHaveBeenCalledWith(
      expect.objectContaining({
        envelope: {
          action_result: expect.objectContaining({
            id: 'saved-id',
          }),
        },
      }),
    );
  });

  test('should report target save errors', async () => {
    const error = new Error('Save failed');
    const save = testing.fn().mockRejectedValue(error);
    const gmp = createGmp({save});
    const onSaveError = testing.fn();
    const target = new Target({name: 'My Target', id: '1234'});
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <TargetComponent onSaveError={onSaveError}>
        {({edit}) => <Button data-testid="open" onClick={() => edit(target)} />}
      </TargetComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await wait();
    await wait();
    fireEvent.click(screen.getDialogSaveButton());
    await wait();

    expect(onSaveError.mock.calls[0][0]).toBe(error);
  });

  test('only saves editable fields for a target in use', async () => {
    const gmp = createGmp();
    const target = new Target({
      name: 'In-use Target',
      id: '1234',
      comment: 'Existing comment',
      inUse: true,
      aliveTests: [SCAN_CONFIG_DEFAULT],
    });

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <TargetComponent>
        {({edit}) => (
          <Button data-testid="button" onClick={() => edit(target)} />
        )}
      </TargetComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    fireEvent.click(screen.getDialogSaveButton());
    await wait();

    expect(gmp.target.save).toHaveBeenCalledWith({
      id: '1234',
      comment: 'Existing comment',
      aliveTests: [SCAN_CONFIG_DEFAULT],
      name: 'In-use Target',
    });
  });

  test('should allow to clone an existing target', async () => {
    const gmp = createGmp();
    const target = new Target({name: 'My Target', id: '1234'});
    const onCloned = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <TargetComponent onCloned={onCloned}>
        {({clone}) => (
          <Button data-testid="button" onClick={() => clone(target)} />
        )}
      </TargetComponent>,
    );

    const button = screen.getByTestId('button');
    fireEvent.click(button);
    await wait();
    expect(gmp.target.clone).toHaveBeenCalledWith({id: target.id});

    await wait();

    expect(onCloned).toHaveBeenCalledWith(
      expect.objectContaining({
        envelope: {
          action_result: expect.objectContaining({
            id: 'cloned-id',
          }),
        },
      }),
    );
  });

  test('should allow to download a target', async () => {
    const gmp = createGmp();
    const target = new Target({name: 'My Target', id: '1234'});

    const {render} = rendererWith({gmp, capabilities: true});
    const onDownloaded = testing.fn();

    render(
      <TargetComponent
        onDownloadError={onDownloaded}
        onDownloaded={onDownloaded}
      >
        {({download}) => (
          <Button data-testid="button" onClick={() => download(target)} />
        )}
      </TargetComponent>,
    );

    // allow user settings to load
    await wait();

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    await wait();

    expect(gmp.target.export).toHaveBeenCalledWith(target);

    expect(onDownloaded).toHaveBeenCalledWith({
      data: 'some-data',
      filename: 'target-1234.xml',
    });
  });

  test('should handle deleting a target', async () => {
    const gmp = createGmp();
    const onDeleted = testing.fn();
    let actions: {delete: (target: Target) => Promise<void>} | undefined;
    const {render} = rendererWith({gmp});

    render(
      <TargetComponent onDeleted={onDeleted}>
        {props => {
          actions = props;
          return null;
        }}
      </TargetComponent>,
    );

    await actions?.delete(new Target({id: 'target-id', name: 'Target'}));

    expect(gmp.target.delete).toHaveBeenCalledWith({
      id: 'target-id',
    });
    expect(onDeleted).toHaveBeenCalled();
  });

  test('should report delete errors', async () => {
    const error = new Error('Delete failed');
    const deleteTarget = testing.fn().mockRejectedValue(error);
    const gmp = createGmp({delete: deleteTarget});
    const onDeleteError = testing.fn();
    let actions: {delete: (target: Target) => Promise<void>} | undefined;
    const {render} = rendererWith({gmp});

    render(
      <TargetComponent onDeleteError={onDeleteError}>
        {props => {
          actions = props;
          return null;
        }}
      </TargetComponent>,
    );

    await expect(
      actions?.delete(new Target({id: 'target-id', name: 'Target'})),
    ).rejects.toThrow(error);
    expect(onDeleteError.mock.calls[0][0]).toBe(error);
  });

  test('should create a credential from the target dialog', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <TargetComponent>
        {({create}) => <Button data-testid="open" onClick={() => create()} />}
      </TargetComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    fireEvent.click(await screen.findByTestId('new-icon-ssh'));

    const dialogs = await screen.findAllByRole('dialog');
    const credentialDialog = within(dialogs[1]);
    fireEvent.change(credentialDialog.getByName('name'), {
      target: {value: 'new-credential'},
    });
    fireEvent.click(credentialDialog.getDialogSaveButton());
    await wait();

    expect(gmp.credential.create).toHaveBeenCalled();
    expect(gmp.credentials.getAll).toHaveBeenCalledTimes(2);
  });

  test('should create a port list from the target dialog', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <TargetComponent>
        {({create}) => <Button data-testid="open" onClick={() => create()} />}
      </TargetComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    fireEvent.click(await screen.findByTitle('Create a new port list'));

    const dialogs = await screen.findAllByRole('dialog');
    const portListDialog = within(dialogs[1]);
    fireEvent.change(portListDialog.getByName('name'), {
      target: {value: 'new-port-list'},
    });
    fireEvent.click(portListDialog.getDialogSaveButton());
    await wait();

    expect(gmp.portlist.create).toHaveBeenCalled();
    expect(gmp.portlists.getAll).toHaveBeenCalledTimes(2);
  });
});
