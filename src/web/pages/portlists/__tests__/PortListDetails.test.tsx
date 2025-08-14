/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import Model from 'gmp/models/model';
import PortList from 'gmp/models/portlist';
import PortListDetails from 'web/pages/portlists/PortListDetails';

describe('PortListDetails tests', () => {
  test('should render deprecated information when entity is deprecated', () => {
    const portList = new PortList({
      comment: 'Test comment',
      portCount: {
        all: 100,
        tcp: 80,
        udp: 20,
      },
      targets: [
        new Model({id: '1', name: 'Target 1'}),
        new Model({id: '2', name: 'Target 2'}),
      ],
      deprecated: true,
    });
    const {render} = rendererWith({capabilities: true});
    render(<PortListDetails entity={portList} />);
    expect(screen.getByText('Deprecated')).toBeInTheDocument();
    expect(screen.getByText('yes')).toBeInTheDocument();
  });

  test('should render comment', () => {
    const portList = new PortList({
      comment: 'Test comment',
      portCount: {
        all: 100,
        tcp: 80,
        udp: 20,
      },
      targets: [
        new Model({id: '1', name: 'Target 1'}),
        new Model({id: '2', name: 'Target 2'}),
      ],
    });
    const {render} = rendererWith({capabilities: true});
    render(<PortListDetails entity={portList} />);
    expect(screen.getByText('Comment')).toBeInTheDocument();
    expect(screen.getByText('Test comment')).toBeInTheDocument();
  });

  test('should render port counts', () => {
    const portList = new PortList({
      comment: 'Test comment',
      portCount: {
        all: 100,
        tcp: 80,
        udp: 20,
      },
      targets: [
        new Model({id: '1', name: 'Target 1'}),
        new Model({id: '2', name: 'Target 2'}),
      ],
    });
    const {render} = rendererWith({capabilities: true});
    render(<PortListDetails entity={portList} />);
    expect(screen.getByText('Port Count')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('TCP Port Count')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('UDP Port Count')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  test('should render targets using the port list', () => {
    const portList = new PortList({
      comment: 'Test comment',
      portCount: {
        all: 100,
        tcp: 80,
        udp: 20,
      },
      targets: [
        new Model({id: '1', name: 'Target 1'}),
        new Model({id: '2', name: 'Target 2'}),
      ],
    });
    const {render} = rendererWith({capabilities: true});
    render(<PortListDetails entity={portList} />);
    expect(
      screen.getByText('Targets using this Port List'),
    ).toBeInTheDocument();
    expect(screen.getByText('Target 1')).toBeInTheDocument();
    expect(screen.getByText('Target 2')).toBeInTheDocument();
  });

  test('should not render deprecated information when entity is not deprecated', () => {
    const portList = new PortList({
      comment: 'Test comment',
      portCount: {
        all: 100,
        tcp: 80,
        udp: 20,
      },
      targets: [
        new Model({id: '1', name: 'Target 1'}),
        new Model({id: '2', name: 'Target 2'}),
      ],
    });
    const {render} = rendererWith({capabilities: true});
    render(<PortListDetails entity={portList} />);
    expect(screen.queryByText('Deprecated')).not.toBeInTheDocument();
  });

  test('should not render targets when no targets are provided', () => {
    const portList = new PortList({
      comment: 'Test comment',
      portCount: {
        all: 100,
        tcp: 80,
        udp: 20,
      },
    });
    const {render} = rendererWith({capabilities: true});
    render(<PortListDetails entity={portList} />);
    expect(
      screen.queryByText('Targets using this Port List'),
    ).not.toBeInTheDocument();
  });
});
