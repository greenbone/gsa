/* Copyright (C) 2020-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';
import {act} from 'react-dom/test-utils';

import {setLocale} from 'gmp/locale/lang';

import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';

import {entitiesLoadingActions} from 'web/store/entities/hosts';

import {KeyCode} from 'gmp/utils/event';

import {rendererWith, fireEvent} from 'web/utils/testing';

import {hostsFilter} from 'web/components/processmap/processmaploader';

import {getMockProcessMap} from '../__mocks__/mockprocessmap';

import ProcessMap from '../processmap';

setLocale('en');

const hostFilter = hostsFilter('31');

const hosts = [
  {name: '123.456.78.910', id: '1234', severity: 5},
  {name: '109.876.54.321', id: '5678', severity: undefined},
];

let getAllHosts;
let renewSession;

beforeEach(() => {
  renewSession = jest.fn().mockResolvedValue({data: {}});

  getAllHosts = jest.fn().mockResolvedValue({
    data: hosts,
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });
});

describe('ProcessMap tests', () => {
  test('should render ProcessMap', () => {
    const {mockProcessMap} = getMockProcessMap();

    const handleForceUpdate = jest.fn();
    const handleSelectElement = jest.fn();
    const handleSelectHost = jest.fn();
    const handleToggleConditionalColorization = jest.fn();
    const gmp = {
      hosts: {
        getAll: getAllHosts,
      },
      user: {renewSession},
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
        onSelectHost={handleSelectHost}
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
    const zoomInIcon = getByTestId('bpm-tool-icon-zoomin');
    const zoomResetIcon = getByTestId('bpm-tool-icon-zoomreset');
    const zoomOutIcon = getByTestId('bpm-tool-icon-zoomout');

    const buttons = element.querySelectorAll('button');
    const header = element.querySelectorAll('th');

    // process map

    // process 1
    expect(processes[0]).toHaveAttribute('cursor', 'grab');
    expect(processes[0]).toHaveTextContent('foo');
    expect(processes[0]).toHaveTextContent('bar');

    expect(circles[0]).toHaveAttribute('fill', '#f0a519');
    expect(circles[0]).toHaveAttribute('cx', '600');
    expect(circles[0]).toHaveAttribute('cy', '300');

    // process 2
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
    expect(zoomInIcon).toHaveAttribute('title', 'Zoom in');
    expect(zoomResetIcon).toHaveAttribute('title', 'Reset zoom');
    expect(zoomOutIcon).toHaveAttribute('title', 'Zoom out');

    // process panel

    expect(element).toHaveTextContent('No process selected');
    expect(icons[7]).toHaveAttribute('title', 'Edit process');

    expect(buttons[0]).toHaveAttribute('title', 'Add Selected Hosts');
    expect(buttons[0]).toHaveTextContent('Add Selected Hosts');

    expect(header[0]).toHaveTextContent('Host');
    expect(header[1]).toHaveTextContent('Name');
    expect(header[2]).toHaveTextContent('Severity');
    expect(header[3]).toHaveTextContent('Actions');

    expect(element).not.toHaveTextContent(
      'No hosts associated with this process.',
    );
  });

  test('should render ProcessMap without map', () => {
    const handleForceUpdate = jest.fn();
    const handleSelectElement = jest.fn();
    const handleSelectHost = jest.fn();
    const handleToggleConditionalColorization = jest.fn();
    const gmp = {
      hosts: {
        getAll: getAllHosts,
      },
      user: {renewSession},
    };

    const {render} = rendererWith({
      gmp,
      store: true,
    });

    const {element, getByTestId, getAllByTestId} = render(
      <ProcessMap
        applyConditionalColorization={false}
        mapId={'1'}
        forceUpdate={handleForceUpdate}
        onSelectElement={handleSelectElement}
        onSelectHost={handleSelectHost}
        onToggleConditionalColorization={handleToggleConditionalColorization}
      />,
    );

    const icons = getAllByTestId('svg-icon');
    const newIcon = getByTestId('bpm-tool-icon-new');
    const edgeIcon = getByTestId('bpm-tool-icon-edge');
    const deleteIcon = getByTestId('bpm-tool-icon-delete');
    const colorIcon = getByTestId('bpm-tool-icon-color');
    const zoomInIcon = getByTestId('bpm-tool-icon-zoomin');
    const zoomResetIcon = getByTestId('bpm-tool-icon-zoomreset');
    const zoomOutIcon = getByTestId('bpm-tool-icon-zoomout');

    const buttons = element.querySelectorAll('button');
    const header = element.querySelectorAll('th');

    // tools
    expect(newIcon).toHaveAttribute('title', 'Create new process');
    expect(edgeIcon).toHaveAttribute('title', 'Create new connection');
    expect(deleteIcon).toHaveAttribute('title', 'Delete selected element');
    expect(colorIcon).toHaveAttribute(
      'title',
      'Turn on conditional colorization',
    );
    expect(zoomInIcon).toHaveAttribute('title', 'Zoom in');
    expect(zoomResetIcon).toHaveAttribute('title', 'Reset zoom');
    expect(zoomOutIcon).toHaveAttribute('title', 'Zoom out');

    // process panel
    expect(element).toHaveTextContent('No process selected');
    expect(icons[7]).toHaveAttribute('title', 'Edit process');

    expect(buttons[0]).toHaveAttribute('title', 'Add Selected Hosts');
    expect(buttons[0]).toHaveTextContent('Add Selected Hosts');

    expect(header[0]).toHaveTextContent('Host');
    expect(header[1]).toHaveTextContent('Name');
    expect(header[2]).toHaveTextContent('Severity');
    expect(header[3]).toHaveTextContent('Actions');

    expect(element).not.toHaveTextContent(
      'No hosts associated with this process.',
    );
  });

  test('should render with selected Element without hosts', () => {
    const {mockProcessMap} = getMockProcessMap();

    const handleForceUpdate = jest.fn();
    const handleSelectElement = jest.fn();
    const handleSelectHost = jest.fn();
    const handleToggleConditionalColorization = jest.fn();

    const getEmptyHostsList = jest.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: Filter.fromString(),
        counts: new CollectionCounts(),
      },
    });

    const gmp = {
      hosts: {
        getAll: getEmptyHostsList,
      },
      user: {renewSession},
    };

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
    });

    const {element, getAllByTestId} = render(
      <ProcessMap
        applyConditionalColorization={true}
        mapId={'1'}
        hostFilter={hostFilter}
        processMaps={mockProcessMap}
        forceUpdate={handleForceUpdate}
        onSelectElement={handleSelectElement}
        onSelectHost={handleSelectHost}
        onToggleConditionalColorization={handleToggleConditionalColorization}
      />,
    );

    store.dispatch(entitiesLoadingActions.success([], hostFilter, hostFilter));

    const circles = getAllByTestId('process-node-circle');

    // select process
    fireEvent.mouseDown(circles[0]);
    fireEvent.mouseUp(circles[0]);

    const icons = getAllByTestId('svg-icon');
    const buttons = element.querySelectorAll('button');
    const header = element.querySelectorAll('th');

    // panel title
    expect(element).toHaveTextContent('foo');
    expect(icons[7]).toHaveAttribute('title', 'Edit process');

    // add hosts
    expect(buttons[0]).toHaveAttribute('title', 'Add Selected Hosts');
    expect(buttons[0]).toHaveTextContent('Add Selected Hosts');

    // host table

    // headings
    expect(header[0]).toHaveTextContent('Host');
    expect(header[1]).toHaveTextContent('Name');
    expect(header[2]).toHaveTextContent('Severity');
    expect(header[3]).toHaveTextContent('Actions');

    expect(element).toHaveTextContent('No hosts associated with this process.');
  });

  test('should render with selected Element with hosts', () => {
    const {mockProcessMap} = getMockProcessMap();

    const handleForceUpdate = jest.fn();
    const handleSelectElement = jest.fn();
    const handleSelectHost = jest.fn();
    const handleToggleConditionalColorization = jest.fn();
    const gmp = {
      hosts: {
        getAll: getAllHosts,
      },
      user: {renewSession},
    };

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
    });

    const {element, getAllByTestId} = render(
      <ProcessMap
        applyConditionalColorization={true}
        mapId={'1'}
        hostFilter={hostFilter}
        processMaps={mockProcessMap}
        forceUpdate={handleForceUpdate}
        onSelectElement={handleSelectElement}
        onSelectHost={handleSelectHost}
        onToggleConditionalColorization={handleToggleConditionalColorization}
      />,
    );

    store.dispatch(
      entitiesLoadingActions.success(hosts, hostFilter, hostFilter),
    );

    const circles = getAllByTestId('process-node-circle');

    // select process
    fireEvent.mouseDown(circles[0]);
    fireEvent.mouseUp(circles[0]);

    const detailsLinks = getAllByTestId('details-link');
    const icons = getAllByTestId('svg-icon');
    const progressBars = getAllByTestId('progressbar-box');
    const buttons = element.querySelectorAll('button');
    const header = element.querySelectorAll('th');

    // panel title
    expect(element).toHaveTextContent('foo');
    expect(icons[7]).toHaveAttribute('title', 'Edit process');

    // add hosts
    expect(buttons[0]).toHaveAttribute('title', 'Add Selected Hosts');
    expect(buttons[0]).toHaveTextContent('Add Selected Hosts');

    // host table

    // Headings
    expect(header[0]).toHaveTextContent('Host');
    expect(header[1]).toHaveTextContent('Name');
    expect(header[2]).toHaveTextContent('Severity');
    expect(header[3]).toHaveTextContent('Actions');

    // Row 1
    expect(detailsLinks[0]).toHaveAttribute('href', '/host/1234');
    expect(detailsLinks[0]).toHaveTextContent('details.svg');
    expect(progressBars[0]).toHaveAttribute('title', 'Medium');
    expect(progressBars[0]).toHaveTextContent('5.0 (Medium)');
    expect(icons[8]).toHaveAttribute('title', 'Remove host from process');
    expect(icons[9]).toHaveAttribute('title', 'Open all details');

    // Row 2
    expect(detailsLinks[1]).toHaveAttribute('href', '/host/5678');
    expect(detailsLinks[1]).toHaveTextContent('details.svg');
    expect(progressBars[1]).toHaveAttribute('title', 'N/A');
    expect(progressBars[1]).toHaveTextContent('N/A');
    expect(icons[10]).toHaveAttribute('title', 'Remove host from process');
    expect(icons[11]).toHaveAttribute('title', 'Open all details');
  });

  test('should call click handler for colorization', () => {
    const {mockProcessMap} = getMockProcessMap();

    const handleForceUpdate = jest.fn();
    const handleSelectElement = jest.fn();
    const handleSelectHost = jest.fn();
    const handleToggleConditionalColorization = jest.fn();

    const gmp = {
      hosts: {
        getAll: getAllHosts,
      },
      user: {renewSession},
    };

    const {render} = rendererWith({
      gmp,
      store: true,
    });

    const {getByTestId} = render(
      <ProcessMap
        applyConditionalColorization={true}
        mapId={'1'}
        processMaps={mockProcessMap}
        forceUpdate={handleForceUpdate}
        onSelectElement={handleSelectElement}
        onSelectHost={handleSelectHost}
        onToggleConditionalColorization={handleToggleConditionalColorization}
      />,
    );

    const colorIcon = getByTestId('bpm-tool-icon-color');

    fireEvent.click(colorIcon);
    expect(handleToggleConditionalColorization).toHaveBeenCalled();
  });

  test('should select elements', () => {
    const {mockProcessMap, processes, edges} = getMockProcessMap();
    const {21: process1} = processes;
    const {11: edge1} = edges;

    const handleForceUpdate = jest.fn();
    const handleSelectElement = jest.fn();
    const handleSelectHost = jest.fn();
    const handleToggleConditionalColorization = jest.fn();

    const saveBusinessProcessMaps = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      hosts: {
        getAll: getAllHosts,
      },
      user: {
        saveBusinessProcessMaps,
        renewSession,
      },
    };

    const {render} = rendererWith({
      gmp,
      store: true,
    });

    const {element, getAllByTestId} = render(
      <ProcessMap
        applyConditionalColorization={true}
        mapId={'1'}
        processMaps={mockProcessMap}
        forceUpdate={handleForceUpdate}
        onSelectElement={handleSelectElement}
        onSelectHost={handleSelectHost}
        onToggleConditionalColorization={handleToggleConditionalColorization}
      />,
    );

    const circles = getAllByTestId('process-node-circle');
    const bpmEdges = getAllByTestId('bpm-edge-line');
    const background = element.querySelectorAll('rect');

    fireEvent.mouseDown(background[0]);
    fireEvent.mouseUp(background[0]);

    expect(handleSelectElement).not.toHaveBeenCalled();

    fireEvent.mouseDown(circles[0]);
    fireEvent.mouseUp(circles[0]);

    expect(handleSelectElement).toHaveBeenCalledWith(process1);

    fireEvent.mouseDown(bpmEdges[0]);
    fireEvent.mouseUp(bpmEdges[0]);

    expect(handleSelectElement).toHaveBeenCalledWith(edge1);
  });

  test('should end drawing mode', () => {
    const {mockProcessMap} = getMockProcessMap();

    const handleForceUpdate = jest.fn();
    const handleSelectElement = jest.fn();
    const handleSelectHost = jest.fn();
    const handleToggleConditionalColorization = jest.fn();

    const saveBusinessProcessMaps = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      hosts: {
        getAll: getAllHosts,
      },
      user: {
        saveBusinessProcessMaps,
        renewSession,
      },
    };

    const {render} = rendererWith({
      gmp,
      store: true,
    });

    const {element, getByTestId, getAllByTestId} = render(
      <ProcessMap
        applyConditionalColorization={true}
        mapId={'1'}
        processMaps={mockProcessMap}
        forceUpdate={handleForceUpdate}
        onSelectElement={handleSelectElement}
        onSelectHost={handleSelectHost}
        onToggleConditionalColorization={handleToggleConditionalColorization}
      />,
    );

    const circles = getAllByTestId('process-node-circle');
    const edgeIcon = getByTestId('bpm-tool-icon-edge');

    expect(edgeIcon).not.toHaveStyleRule('background-color', '#66c430');
    fireEvent.click(edgeIcon);
    expect(edgeIcon).toHaveStyleRule('background-color', '#66c430');

    fireEvent.mouseDown(circles[2]);
    fireEvent.mouseUp(circles[2]);

    expect(saveBusinessProcessMaps).not.toHaveBeenCalled();

    fireEvent.keyDown(element, {key: 'Escape', keyCode: KeyCode.Escape});

    expect(edgeIcon).not.toHaveStyleRule('background-color', '#66c430');

    expect(saveBusinessProcessMaps).not.toHaveBeenCalled();
  });

  test('should save map when drawing new edge', () => {
    const {mockProcessMap} = getMockProcessMap();

    const handleForceUpdate = jest.fn();
    const handleSelectElement = jest.fn();
    const handleSelectHost = jest.fn();
    const handleToggleConditionalColorization = jest.fn();

    const saveBusinessProcessMaps = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      hosts: {
        getAll: getAllHosts,
      },
      user: {
        saveBusinessProcessMaps,
        renewSession,
      },
    };

    const {render} = rendererWith({
      gmp,
      store: true,
    });

    const {getByTestId, getAllByTestId} = render(
      <ProcessMap
        applyConditionalColorization={true}
        mapId={'1'}
        processMaps={mockProcessMap}
        forceUpdate={handleForceUpdate}
        onSelectElement={handleSelectElement}
        onSelectHost={handleSelectHost}
        onToggleConditionalColorization={handleToggleConditionalColorization}
      />,
    );

    const circles = getAllByTestId('process-node-circle');
    const edgeIcon = getByTestId('bpm-tool-icon-edge');

    expect(edgeIcon).not.toHaveStyleRule('background-color', '#66c430');
    fireEvent.click(edgeIcon);
    expect(edgeIcon).toHaveStyleRule('background-color', '#66c430');

    fireEvent.mouseDown(circles[2]);
    fireEvent.mouseUp(circles[2]);

    expect(saveBusinessProcessMaps).not.toHaveBeenCalled();

    fireEvent.mouseDown(circles[1]);
    fireEvent.mouseUp(circles[1]);

    expect(edgeIcon).not.toHaveStyleRule('background-color', '#66c430');

    expect(saveBusinessProcessMaps).toHaveBeenCalled();
  });

  test('should save map when deleting an edge', () => {
    const {mockProcessMap} = getMockProcessMap();

    const handleForceUpdate = jest.fn();
    const handleSelectElement = jest.fn();
    const handleSelectHost = jest.fn();
    const handleToggleConditionalColorization = jest.fn();

    const saveBusinessProcessMaps = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      hosts: {
        getAll: getAllHosts,
      },
      user: {
        saveBusinessProcessMaps,
        renewSession,
      },
    };

    const {render} = rendererWith({
      gmp,
      store: true,
    });

    const {getByTestId, getAllByTestId} = render(
      <ProcessMap
        applyConditionalColorization={true}
        mapId={'1'}
        processMaps={mockProcessMap}
        forceUpdate={handleForceUpdate}
        onSelectElement={handleSelectElement}
        onSelectHost={handleSelectHost}
        onToggleConditionalColorization={handleToggleConditionalColorization}
      />,
    );

    const edges = getAllByTestId('bpm-edge-line');
    const deleteIcon = getByTestId('bpm-tool-icon-delete');

    fireEvent.mouseDown(edges[0]);
    fireEvent.mouseUp(edges[0]);

    expect(saveBusinessProcessMaps).not.toHaveBeenCalled();

    fireEvent.click(deleteIcon);

    expect(saveBusinessProcessMaps).toHaveBeenCalled();
  });

  test('should save map when deleting an edge with delete key', () => {
    const {mockProcessMap} = getMockProcessMap();

    const handleForceUpdate = jest.fn();
    const handleSelectElement = jest.fn();
    const handleSelectHost = jest.fn();
    const handleToggleConditionalColorization = jest.fn();

    const saveBusinessProcessMaps = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      hosts: {
        getAll: getAllHosts,
      },
      user: {
        saveBusinessProcessMaps,
        renewSession,
      },
    };

    const {render} = rendererWith({
      gmp,
      store: true,
    });

    const {element, getAllByTestId} = render(
      <ProcessMap
        applyConditionalColorization={true}
        mapId={'1'}
        processMaps={mockProcessMap}
        forceUpdate={handleForceUpdate}
        onSelectElement={handleSelectElement}
        onSelectHost={handleSelectHost}
        onToggleConditionalColorization={handleToggleConditionalColorization}
      />,
    );

    const edges = getAllByTestId('bpm-edge-line');

    fireEvent.mouseDown(edges[0]);
    fireEvent.mouseUp(edges[0]);

    expect(saveBusinessProcessMaps).not.toHaveBeenCalled();

    fireEvent.keyDown(element, {key: 'Delete', keyCode: KeyCode.Delete});

    expect(saveBusinessProcessMaps).toHaveBeenCalled();
  });

  test('should save map after a process was moved', () => {
    const {mockProcessMap} = getMockProcessMap();

    const handleForceUpdate = jest.fn();
    const handleSelectElement = jest.fn();
    const handleSelectHost = jest.fn();
    const handleToggleConditionalColorization = jest.fn();

    const saveBusinessProcessMaps = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      hosts: {
        getAll: getAllHosts,
      },
      user: {
        saveBusinessProcessMaps,
        renewSession,
      },
    };

    const {render} = rendererWith({
      gmp,
      store: true,
    });

    const {getAllByTestId} = render(
      <ProcessMap
        applyConditionalColorization={true}
        mapId={'1'}
        processMaps={mockProcessMap}
        forceUpdate={handleForceUpdate}
        onSelectElement={handleSelectElement}
        onSelectHost={handleSelectHost}
        onToggleConditionalColorization={handleToggleConditionalColorization}
      />,
    );

    const circles = getAllByTestId('process-node-circle');

    fireEvent.mouseDown(circles[0]);

    expect(saveBusinessProcessMaps).not.toHaveBeenCalled();

    fireEvent.mouseMove(circles[0]);

    expect(saveBusinessProcessMaps).not.toHaveBeenCalled();

    fireEvent.mouseUp(circles[0]);

    expect(saveBusinessProcessMaps).toHaveBeenCalled();
  });

  test('should force update for deleting a host', async () => {
    const {mockProcessMap} = getMockProcessMap();

    const handleForceUpdate = jest.fn();
    const handleSelectElement = jest.fn();
    const handleSelectHost = jest.fn();
    const handleToggleConditionalColorization = jest.fn();

    const saveTag = jest.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: Filter.fromString(),
        counts: new CollectionCounts(),
      },
    });

    const gmp = {
      hosts: {
        getAll: getAllHosts,
      },
      tag: {
        save: saveTag,
      },
      user: {renewSession},
    };

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
    });

    const {getAllByTestId} = render(
      <ProcessMap
        applyConditionalColorization={true}
        mapId={'1'}
        hostFilter={hostFilter}
        processMaps={mockProcessMap}
        forceUpdate={handleForceUpdate}
        onSelectElement={handleSelectElement}
        onSelectHost={handleSelectHost}
        onToggleConditionalColorization={handleToggleConditionalColorization}
      />,
    );

    store.dispatch(
      entitiesLoadingActions.success(hosts, hostFilter, hostFilter),
    );

    const circles = getAllByTestId('process-node-circle');

    // select process
    fireEvent.mouseDown(circles[0]);
    fireEvent.mouseUp(circles[0]);

    const icons = getAllByTestId('svg-icon');

    await act(async () => {
      expect(icons[8]).toHaveAttribute('title', 'Remove host from process');
      fireEvent.click(icons[8]);
    });

    expect(handleForceUpdate).toHaveBeenCalled();
  });

  test('should zoom', () => {
    const {mockProcessMap} = getMockProcessMap();

    const handleForceUpdate = jest.fn();
    const handleSelectElement = jest.fn();
    const handleSelectHost = jest.fn();
    const handleToggleConditionalColorization = jest.fn();
    const gmp = {
      hosts: {
        getAll: getAllHosts,
      },
      user: {renewSession},
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
        onSelectHost={handleSelectHost}
        onToggleConditionalColorization={handleToggleConditionalColorization}
      />,
    );

    const zoomInIcon = getByTestId('bpm-tool-icon-zoomin');
    const zoomResetIcon = getByTestId('bpm-tool-icon-zoomreset');
    const zoomOutIcon = getByTestId('bpm-tool-icon-zoomout');
    const svgs = element.querySelectorAll('svg');
    let processes = getAllByTestId('process-node-group');

    expect(processes[0]).toHaveAttribute('scale', '0.7');
    expect(processes[1]).toHaveAttribute('scale', '0.7');

    fireEvent.click(zoomInIcon);

    processes = getAllByTestId('process-node-group');

    expect(processes[0]).toHaveAttribute('scale', '0.8');
    expect(processes[1]).toHaveAttribute('scale', '0.8');

    fireEvent.click(zoomOutIcon);
    fireEvent.click(zoomOutIcon);
    fireEvent.click(zoomOutIcon);

    expect(processes[0]).toHaveAttribute('scale', '0.5');
    expect(processes[1]).toHaveAttribute('scale', '0.5');

    fireEvent.click(zoomResetIcon);

    expect(processes[0]).toHaveAttribute('scale', '0.7');
    expect(processes[1]).toHaveAttribute('scale', '0.7');

    fireEvent.wheel(zoomInIcon);

    expect(processes[0]).toHaveAttribute('scale', '0.7');
    expect(processes[1]).toHaveAttribute('scale', '0.7');

    fireEvent.wheel(svgs[0]);

    expect(processes[0]).toHaveAttribute('scale', '0.8');
    expect(processes[1]).toHaveAttribute('scale', '0.8');
  });
});
