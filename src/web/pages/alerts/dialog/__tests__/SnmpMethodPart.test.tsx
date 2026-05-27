/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {changeInputValue, rendererWith, screen} from 'web/testing';
import SnmpMethodPart from 'web/pages/alerts/dialog/SnmpMethodPart';

describe('SnmpMethodPart tests', () => {
  test('should render SnmpMethodPart component', () => {
    const onChange = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <SnmpMethodPart
        snmpAgent="agent"
        snmpCommunity="community"
        snmpMessage="message"
        onChange={onChange}
      />,
    );

    const communityInput = screen.getByRole('textbox', {name: 'Community'});
    expect(communityInput).toHaveAttribute('name', 'snmp_community');
    expect(communityInput).toHaveValue('community');

    const agentInput = screen.getByRole('textbox', {name: 'Agent'});
    expect(agentInput).toHaveAttribute('name', 'snmp_agent');
    expect(agentInput).toHaveValue('agent');

    const messageInput = screen.getByRole('textbox', {name: 'Message'});
    expect(messageInput).toHaveAttribute('name', 'snmp_message');
    expect(messageInput).toHaveValue('message');
  });

  test('should render with prefix', () => {
    const onChange = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <SnmpMethodPart
        prefix="test"
        snmpAgent="agent"
        snmpCommunity="community"
        snmpMessage="message"
        onChange={onChange}
      />,
    );

    const communityInput = screen.getByRole('textbox', {name: 'Community'});
    expect(communityInput).toHaveAttribute('name', 'test_snmp_community');
    expect(communityInput).toHaveValue('community');

    const agentInput = screen.getByRole('textbox', {name: 'Agent'});
    expect(agentInput).toHaveAttribute('name', 'test_snmp_agent');
    expect(agentInput).toHaveValue('agent');

    const messageInput = screen.getByRole('textbox', {name: 'Message'});
    expect(messageInput).toHaveAttribute('name', 'test_snmp_message');
    expect(messageInput).toHaveValue('message');
  });

  test('should allow to change values', () => {
    const onChange = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <SnmpMethodPart
        snmpAgent="agent"
        snmpCommunity="community"
        snmpMessage="message"
        onChange={onChange}
      />,
    );

    const communityInput = screen.getByRole('textbox', {name: 'Community'});
    changeInputValue(communityInput, 'new_community');
    expect(onChange).toHaveBeenCalledWith('new_community', 'snmp_community');

    const agentInput = screen.getByRole('textbox', {name: 'Agent'});
    changeInputValue(agentInput, 'new_agent');
    expect(onChange).toHaveBeenCalledWith('new_agent', 'snmp_agent');

    const messageInput = screen.getByRole('textbox', {name: 'Message'});
    changeInputValue(messageInput, 'new_message');
    expect(onChange).toHaveBeenCalledWith('new_message', 'snmp_message');
  });
});
