/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  changeFileInput,
  changeInputValue,
  fireEvent,
  getSelectItemElementsForSelect,
  rendererWith,
  screen,
} from 'web/testing';
import Credential, {PASSWORD_ONLY_CREDENTIAL_TYPE} from 'gmp/models/credential';
import SourceFireMethodPart from 'web/pages/alerts/dialog/SourceFireMethodPart';
import {UNSET_LABEL} from 'web/utils/Render';

describe('SourceFireMethodPart tests', () => {
  test('should render SourceFireMethodPart component', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <SourceFireMethodPart
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const defenseCenterIpInput = screen.getByRole('textbox', {
      name: 'Defense Center IP',
    });
    expect(defenseCenterIpInput).toHaveAttribute('name', 'defense_center_ip');

    const defenseCenterPortInput = screen.getByRole('spinbutton', {
      name: 'Defense Center Port',
    });
    expect(defenseCenterPortInput).toHaveAttribute(
      'name',
      'defense_center_port',
    );

    expect(screen.getByName('pkcs12_credential')).toBeInTheDocument();
    const credentialSelect = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'PKCS12 Credential',
    });
    const credentialOptions =
      await getSelectItemElementsForSelect(credentialSelect);
    expect(credentialOptions).toHaveLength(1);
    expect(credentialOptions[0]).toHaveTextContent(UNSET_LABEL);

    const pkcs12FileInput = screen.getByName('pkcs12');
    expect(pkcs12FileInput).toBeInTheDocument();
  });

  test('should render with prefix', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <SourceFireMethodPart
        prefix="test"
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const defenseCenterIpInput = screen.getByRole('textbox', {
      name: 'Defense Center IP',
    });
    expect(defenseCenterIpInput).toHaveAttribute(
      'name',
      'test_defense_center_ip',
    );

    const defenseCenterPortInput = screen.getByRole('spinbutton', {
      name: 'Defense Center Port',
    });
    expect(defenseCenterPortInput).toHaveAttribute(
      'name',
      'test_defense_center_port',
    );

    expect(screen.getByName('test_pkcs12_credential')).toBeInTheDocument();
    const credentialSelect = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'PKCS12 Credential',
    });
    const credentialOptions =
      await getSelectItemElementsForSelect(credentialSelect);
    expect(credentialOptions).toHaveLength(1);
    expect(credentialOptions[0]).toHaveTextContent(UNSET_LABEL);

    const pkcs12FileInput = screen.getByName('test_pkcs12');
    expect(pkcs12FileInput).toBeInTheDocument();
  });

  test('should allow to change defense center ip and port', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <SourceFireMethodPart
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const defenseCenterIpInput = screen.getByRole('textbox', {
      name: 'Defense Center IP',
    });
    changeInputValue(defenseCenterIpInput, '192.168.1.1');
    expect(onChange).toHaveBeenCalledWith('192.168.1.1', 'defense_center_ip');

    const defenseCenterPortInput = screen.getByRole('spinbutton', {
      name: 'Defense Center Port',
    });
    changeInputValue(defenseCenterPortInput, '443');
    expect(onChange).toHaveBeenCalledWith(443, 'defense_center_port');
  });

  test('should allow to change pkcs12 credential', async () => {
    const credential1 = new Credential({
      id: 'credential1',
      name: 'Credential 1',
      credentialType: PASSWORD_ONLY_CREDENTIAL_TYPE,
    });
    const credential2 = new Credential({
      id: 'credential2',
      name: 'Credential 2',
      credentialType: PASSWORD_ONLY_CREDENTIAL_TYPE,
    });
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <SourceFireMethodPart
        credentials={[credential1, credential2]}
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const credentialSelect = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'PKCS12 Credential',
    });
    const credentialOptions =
      await getSelectItemElementsForSelect(credentialSelect);
    expect(credentialOptions).toHaveLength(3);
    expect(credentialOptions[0]).toHaveTextContent(UNSET_LABEL);
    expect(credentialOptions[1]).toHaveTextContent(credential1.name as string);
    expect(credentialOptions[2]).toHaveTextContent(credential2.name as string);

    fireEvent.click(credentialOptions[1]);
    expect(onCredentialChange).toHaveBeenCalledWith(
      credential1.id,
      'pkcs12_credential',
    );
  });

  test('should allow to create a new credential', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <SourceFireMethodPart
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const newCredentialButton = screen.getByRole('button', {
      name: 'New Icon',
    });
    fireEvent.click(newCredentialButton);
    expect(onNewCredentialClick).toHaveBeenCalled();
  });

  test('should allow to change pkcs12 file', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <SourceFireMethodPart
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const pkcs12FileInput = screen.getByName('pkcs12') as HTMLInputElement;
    changeFileInput(pkcs12FileInput, 'test_file.p12');
    expect(onChange).toHaveBeenCalledWith('test_file.p12', 'pkcs12');
  });
});
