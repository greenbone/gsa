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
import Credential, {
  SNMP_CREDENTIAL_TYPE,
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import TippingPointMethodPart, {
  TIPPING_POINT_CREDENTIAL_TYPES,
} from 'web/pages/alerts/dialog/TippingPointMethodPart';

describe('TippingPointMethodPart tests', () => {
  test('should render TippingPointMethodPart component', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <TippingPointMethodPart
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const hostnameInput = screen.getByRole('textbox', {
      name: 'Hostname / IP',
    });
    expect(hostnameInput).toHaveAttribute('name', 'tp_sms_hostname');

    expect(screen.getByName('tp_sms_credential')).toBeInTheDocument();
    expect(screen.getByName('tp_sms_tls_certificate')).toBeInTheDocument();

    const yesRadio = screen.getByRole('radio', {name: 'Yes'});
    expect(yesRadio).toHaveAttribute('name', 'tp_sms_tls_workaround');
    expect(yesRadio).toHaveAttribute('value', `${YES_VALUE}`);

    const noRadio = screen.getByRole('radio', {name: 'No'});
    expect(noRadio).toHaveAttribute('name', 'tp_sms_tls_workaround');
    expect(noRadio).toHaveAttribute('value', `${NO_VALUE}`);
  });

  test('should render with prefix', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <TippingPointMethodPart
        prefix="test"
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const hostnameInput = screen.getByRole('textbox', {
      name: 'Hostname / IP',
    });
    expect(hostnameInput).toHaveAttribute('name', 'test_tp_sms_hostname');

    expect(screen.getByName('test_tp_sms_credential')).toBeInTheDocument();
    expect(screen.getByName('test_tp_sms_tls_certificate')).toBeInTheDocument();

    const yesRadio = screen.getByRole('radio', {name: 'Yes'});
    expect(yesRadio).toHaveAttribute('name', 'test_tp_sms_tls_workaround');
    expect(yesRadio).toHaveAttribute('value', `${YES_VALUE}`);

    const noRadio = screen.getByRole('radio', {name: 'No'});
    expect(noRadio).toHaveAttribute('name', 'test_tp_sms_tls_workaround');
    expect(noRadio).toHaveAttribute('value', `${NO_VALUE}`);
  });

  test('should allow to change hostname', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <TippingPointMethodPart
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const hostnameInput = screen.getByRole('textbox', {
      name: 'Hostname / IP',
    });
    changeInputValue(hostnameInput, 'example.com');
    expect(onChange).toHaveBeenCalledWith('example.com', 'tp_sms_hostname');
  });

  test('should allow to change credential', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const credential1 = new Credential({
      id: 'credential1',
      name: 'Credential 1',
      credentialType: USERNAME_PASSWORD_CREDENTIAL_TYPE,
    });
    const credential2 = new Credential({
      id: 'credential2',
      name: 'Credential 2',
      credentialType: USERNAME_PASSWORD_CREDENTIAL_TYPE,
    });
    const credential3 = new Credential({
      id: 'credential3',
      name: 'Credential 3',
      credentialType: SNMP_CREDENTIAL_TYPE,
    });
    const {render} = rendererWith({capabilities: true});
    render(
      <TippingPointMethodPart
        credentials={[credential1, credential2, credential3]}
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const select = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Credential',
    });
    const options = await getSelectItemElementsForSelect(select);
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('Credential 1');
    expect(options[1]).toHaveTextContent('Credential 2');

    fireEvent.click(options[1]);
    expect(onCredentialChange).toHaveBeenCalledWith(
      'credential2',
      'tp_sms_credential',
    );
  });

  test('should allow to create new credential', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <TippingPointMethodPart
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const newIconButton = screen.getByRole('button', {
      name: 'New Icon',
    });
    fireEvent.click(newIconButton);
    expect(onNewCredentialClick).toHaveBeenCalledWith(
      TIPPING_POINT_CREDENTIAL_TYPES,
    );
  });

  test('should allow to change TLS certificate file', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <TippingPointMethodPart
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const certificateFileInput = screen.getByName(
      'tp_sms_tls_certificate',
    ) as HTMLInputElement;
    changeFileInput(certificateFileInput, 'test_certificate.pem');
    expect(onChange).toHaveBeenCalledWith(
      'test_certificate.pem',
      'tp_sms_tls_certificate',
    );
  });

  test('should allow to change TLS workaround setting', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <TippingPointMethodPart
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const yesRadio = screen.getByRole('radio', {name: 'Yes'});
    fireEvent.click(yesRadio);
    expect(onChange).toHaveBeenCalledWith(YES_VALUE, 'tp_sms_tls_workaround');

    const noRadio = screen.getByRole('radio', {name: 'No'});
    fireEvent.click(noRadio);
    expect(onChange).toHaveBeenCalledWith(NO_VALUE, 'tp_sms_tls_workaround');
  });
});
