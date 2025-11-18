/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait} from 'web/testing';
import {createActionResultResponse} from 'gmp/commands/testing';
import Response from 'gmp/http/response';
import type Model from 'gmp/models/model';
import Setting from 'gmp/models/setting';
import Target, {SCAN_CONFIG_DEFAULT} from 'gmp/models/target';
import Button from 'web/components/form/Button';
import TargetComponent from 'web/pages/targets/TargetComponent';
import {DEFAULT_PORT_LIST_ID} from 'web/pages/targets/TargetDialog';

const createGmp = ({
  credentials = [],
  portlists = [],
}: {credentials?: Model[]; portlists?: Model[]} = {}) => {
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
    credentials: {
      getAll: testing.fn().mockResolvedValue(new Response(credentials)),
    },
    portlists: {
      getAll: testing.fn().mockResolvedValue(new Response(portlists)),
    },
    target: {
      create: testing
        .fn()
        .mockResolvedValue(createActionResultResponse({id: 'new-id'})),
      save: testing
        .fn()
        .mockResolvedValue(createActionResultResponse({id: 'saved-id'})),
      clone: testing
        .fn()
        .mockResolvedValue(createActionResultResponse({id: 'cloned-id'})),
      export: testing.fn().mockResolvedValue(new Response('some-data')),
    },
  };
};

describe('TargetComponent tests', () => {
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
    fireEvent.click(screen.getDialogSaveButton());

    expect(gmp.target.create).toHaveBeenCalledWith({
      aliveTests: [SCAN_CONFIG_DEFAULT],
      allowSimultaneousIPs: true,
      comment: '',
      esxiCredentialId: '0',
      excludeHosts: '',
      hosts: '',
      hostsCount: undefined,
      hostsFilter: undefined,
      id: undefined,
      inUse: false,
      krb5CredentialId: '0',
      name: 'Unnamed',
      port: 22,
      portListId: DEFAULT_PORT_LIST_ID,
      reverseLookupOnly: 0,
      reverseLookupUnify: 0,
      smbCredentialId: '0',
      snmpCredentialId: '0',
      sshCredentialId: '0',
      sshElevateCredentialId: '0',
      targetExcludeSource: 'manual',
      targetSource: 'manual',
    });

    await wait();

    expect(onCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        _data: {
          envelope: {
            action_result: expect.objectContaining({
              id: 'new-id',
            }),
          },
        },
      }),
    );
  });

  test('should allow to edit an existing target', async () => {
    const gmp = createGmp();
    const target = new Target({name: 'My Target', id: '1234'});
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
    fireEvent.click(screen.getDialogSaveButton());

    expect(gmp.target.save).toHaveBeenCalledWith({
      aliveTests: [],
      allowSimultaneousIPs: false,
      comment: '',
      esxiCredentialId: '0',
      excludeHosts: '',
      hosts: '',
      hostsCount: undefined,
      hostsFilter: undefined,
      id: '1234',
      inUse: false,
      krb5CredentialId: '0',
      name: 'My Target',
      port: 22,
      portListId: DEFAULT_PORT_LIST_ID,
      reverseLookupOnly: 0,
      reverseLookupUnify: 0,
      smbCredentialId: '0',
      snmpCredentialId: '0',
      sshCredentialId: '0',
      sshElevateCredentialId: '0',
      targetExcludeSource: 'manual',
      targetSource: 'manual',
    });

    await wait();

    expect(onSaved).toHaveBeenCalledWith(
      expect.objectContaining({
        _data: {
          envelope: {
            action_result: expect.objectContaining({
              id: 'saved-id',
            }),
          },
        },
      }),
    );
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
    expect(gmp.target.clone).toHaveBeenCalledWith(target);

    await wait();

    expect(onCloned).toHaveBeenCalledWith(
      expect.objectContaining({
        _data: {
          envelope: {
            action_result: expect.objectContaining({
              id: 'cloned-id',
            }),
          },
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
    expect(gmp.target.export).toHaveBeenCalledWith(target);

    await wait();

    expect(onDownloaded).toHaveBeenCalledWith({
      data: 'some-data',
      filename: 'target-1234.xml',
    });
  });
});
