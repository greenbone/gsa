/* Copyright (C) 2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import {setLocale} from 'gmp/locale/lang';

import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';

import {rendererWith} from 'web/utils/testing';

import ProcessMap from '../processmap';

setLocale('en');

export const getMockProcessMap = () => {
  const mockProcessMap = {
    edges: {11: {id: 11, source: 21, target: 22, type: 'edge'}},
    processes: {
      21: {
        color: '#f0a519',
        comment: 'bar',
        derivedSeverity: 5,
        id: '21',
        name: 'foo',
        severity: 5,
        tagId: 31,
        type: 'process',
        x: 600,
        y: 300,
      },
      22: {
        color: '#f0a519',
        comment: 'ipsum',
        derivedSeverity: 5,
        id: '22',
        name: 'lorem',
        severity: undefined,
        tagId: 32,
        type: 'process',
        x: 300,
        y: 200,
      },
    },
  };
  return {
    mockProcessMap,
    processes: mockProcessMap.processes,
    edges: mockProcessMap.edges,
  };
};

const hosts = [
  {name: '123.456.78.910', id: '1234', severity: 5},
  {name: '109.876.54.321', id: '5678', severity: undefined},
];

const getAllHosts = jest.fn().mockResolvedValue({
  data: [hosts],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

describe('ProcessMap tests', () => {
  test('should render ProcessMap', () => {
    const {mockProcessMap} = getMockProcessMap();

    const handleForceUpdate = jest.fn();
    const handleSelectElement = jest.fn();
    const handleToggleConditionalColorization = jest.fn();
    const gmp = {
      hosts: {
        getAll: getAllHosts,
      },
    };

    const {render} = rendererWith({
      gmp,
      store: true,
    });

    const {element, getByTestId, getAllByTestId} = render(
      <ProcessMap
        applyConditionalColorization={false}
        mapId={'1'}
        processMaps={mockProcessMap}
        forceUpdate={handleForceUpdate}
        onSelectElement={handleSelectElement}
        onToggleConditionalColorization={handleToggleConditionalColorization}
      />,
    );

    const processes = getAllByTestId('process-node-group');
    const circles = getAllByTestId('process-node-circle');
    const edges = getAllByTestId('bpm-edge-line');
    const icons = getAllByTestId('svg-icon');

    const newIcon = getByTestId('bpm-tool-icon-new');
    const edgeIcon = getByTestId('bpm-tool-icon-edge');
    const deleteIcon = getByTestId('bpm-tool-icon-delete');
    const colorIcon = getByTestId('bpm-tool-icon-color');
    const helpIcon = getByTestId('bpm-tool-icon-help');

    const buttons = element.querySelectorAll('button');
    const header = element.querySelectorAll('th');

    // process map

    // process 1
    expect(processes[0]).toHaveAttribute('name', 'foo');
    expect(processes[0]).toHaveAttribute('id', '21');
    expect(processes[0]).toHaveAttribute('cursor', 'grab');
    expect(processes[0]).toHaveTextContent('foo');
    expect(processes[0]).toHaveTextContent('bar');

    expect(circles[0]).toHaveAttribute('fill', '#f0a519');
    expect(circles[0]).toHaveAttribute('cx', '600');
    expect(circles[0]).toHaveAttribute('cy', '300');

    // process 2
    expect(processes[1]).toHaveAttribute('name', 'lorem');
    expect(processes[1]).toHaveAttribute('id', '22');
    expect(processes[1]).toHaveAttribute('cursor', 'grab');
    expect(processes[1]).toHaveTextContent('lorem');
    expect(processes[1]).toHaveTextContent('ipsum');

    expect(circles[1]).toHaveAttribute('fill', '#f0a519');
    expect(circles[1]).toHaveAttribute('cx', '300');
    expect(circles[1]).toHaveAttribute('cy', '200');

    // edge
    expect(edges[0]).toHaveAttribute('x1', '600');
    expect(edges[0]).toHaveAttribute('x2', '300');
    expect(edges[0]).toHaveAttribute('y1', '300');
    expect(edges[0]).toHaveAttribute('y2', '200');
    expect(edges[0]).toHaveAttribute('fill', '#393637');

    // tools

    expect(newIcon).toHaveAttribute('title', 'Create new process');
    expect(edgeIcon).toHaveAttribute('title', 'Create new connection');
    expect(deleteIcon).toHaveAttribute('title', 'Delete selected element');
    expect(colorIcon).toHaveAttribute(
      'title',
      'Turn on conditional colorization',
    );
    expect(helpIcon).toHaveAttribute('title', 'Quick Help');

    // process panel

    expect(element).toHaveTextContent('No process selected');
    expect(icons[5]).toHaveAttribute('title', 'Edit process');

    expect(buttons[0]).toHaveAttribute('title', 'Add Selected Hosts');
    expect(buttons[0]).toHaveTextContent('Add Selected Hosts');

    expect(header[0]).toHaveTextContent('Host');
    expect(header[1]).toHaveTextContent('Severity');
    expect(header[2]).toHaveTextContent('Actions');

    expect(element).not.toHaveTextContent(
      'No hosts associated with this process.',
    );
  });
});
