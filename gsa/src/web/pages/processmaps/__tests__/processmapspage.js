/* Copyright (C) 2020 Greenbone Networks GmbH
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

import {setLocale} from 'gmp/locale/lang';

import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';

import {getBusinessProcessMapsAction} from 'web/store/businessprocessmaps/actions';
import {entitiesLoadingActions} from 'web/store/entities/hosts';

import {rendererWith, fireEvent} from 'web/utils/testing';

import {hostsFilter} from 'web/components/processmap/processmaploader';

import {getMockProcessMap} from 'web/components/processmap/__mocks__/mockprocessmap';

import ProcessMapsPage from '../processmapspage';
import {createRenewSessionQueryResultMock} from 'web/utils/testing/querymocks';

setLocale('en');

const {mockProcessMap} = getMockProcessMap();

const processMaps = {1: mockProcessMap};

const manualUrl = 'test/';

const hostFilter1 = hostsFilter('31');
const hostFilter2 = hostsFilter('32');
const hostFilter3 = hostsFilter('33');

const hosts = [
  {name: '123.456.78.910', id: '1234', severity: 5},
  {name: '109.876.54.321', id: '5678', severity: undefined},
  {name: '109.876.54.123', id: '9101', severity: 10},
];

const getAllHosts = jest.fn().mockResolvedValue({
  data: hosts,
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const getHosts = jest.fn().mockResolvedValue({
  data: hosts,
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const getTag = jest.fn().mockResolvedValue({
  data: '',
});

const renewDate = '2019-10-10T12:00:00Z';

const [queryMock, resultFunc] = createRenewSessionQueryResultMock(renewDate);

const renewSession = jest.fn().mockResolvedValue({data: renewDate});

const getBusinessProcessMaps = jest.fn().mockResolvedValue({
  foo: 'bar',
});

describe('ProcessMapsPage tests', () => {
  test('should render ProcessMapsPage with empty map', () => {
    const gmp = {
      hosts: {
        getAll: getAllHosts,
      },
      user: {
        getBusinessProcessMaps,
        renewSession,
      },
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      store: true,
      queryMocks: [queryMock],
    });

    const {element, getByTestId, getAllByTestId} = render(<ProcessMapsPage />);

    const icons = getAllByTestId('svg-icon');

    const newIcon = getByTestId('bpm-tool-icon-new');
    const edgeIcon = getByTestId('bpm-tool-icon-edge');
    const deleteIcon = getByTestId('bpm-tool-icon-delete');
    const colorIcon = getByTestId('bpm-tool-icon-color');
    const zoomInIcon = getByTestId('bpm-tool-icon-zoomin');
    const zoomResetIcon = getByTestId('bpm-tool-icon-zoomreset');
    const zoomOutIcon = getByTestId('bpm-tool-icon-zoomout');

    const buttons = element.querySelectorAll('button');
    const links = element.querySelectorAll('a');
    const sectionHeader = element.querySelectorAll('h2');
    const header = element.querySelectorAll('th');

    // toolbar
    expect(icons[0]).toHaveAttribute('title', 'Help: Business Process Map');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/reports.html#using-business-process-maps',
    );

    // header
    expect(icons[1]).toHaveTextContent('bpm.svg');
    expect(sectionHeader[0]).toHaveTextContent('Business Process Map');

    // tools
    expect(newIcon).toHaveAttribute('title', 'Create new process');
    expect(newIcon).toHaveTextContent('Click here to create a process.');
    expect(edgeIcon).toHaveAttribute('title', 'Create new connection');
    expect(deleteIcon).toHaveAttribute('title', 'Delete selected element');
    expect(colorIcon).toHaveAttribute(
      'title',
      'Turn off conditional colorization',
    );
    expect(zoomInIcon).toHaveAttribute('title', 'Zoom in');
    expect(zoomResetIcon).toHaveAttribute('title', 'Reset zoom');
    expect(zoomOutIcon).toHaveAttribute('title', 'Zoom out');

    // process panel
    expect(element).toHaveTextContent('No process selected');
    expect(icons[9]).toHaveAttribute('title', 'Edit process');

    expect(buttons[0]).toHaveAttribute('title', 'Add Selected Hosts');
    expect(buttons[0]).toHaveTextContent('Add Selected Hosts');

    expect(header[0]).toHaveTextContent('Host');
    expect(header[1]).toHaveTextContent('Severity');
    expect(header[2]).toHaveTextContent('Actions');

    expect(element).not.toHaveTextContent(
      'No hosts associated with this process.',
    );
  });

  test('should render ProcessMapsPage', () => {
    const gmp = {
      hosts: {
        get: getHosts,
        getAll: getAllHosts,
      },
      tag: {
        get: getTag,
      },
      user: {
        getBusinessProcessMaps,
        renewSession,
      },
      settings: {manualUrl},
    };

    const {render, store} = rendererWith({
      gmp,
      store: true,
      queryMocks: [queryMock],
    });

    const {element, getByTestId, getAllByTestId} = render(<ProcessMapsPage />);

    store.dispatch(getBusinessProcessMapsAction(processMaps));

    const processes = getAllByTestId('process-node-group');
    const circles = getAllByTestId('process-node-circle');
    const edges = getAllByTestId('bpm-edge-line');
    const icons = getAllByTestId('svg-icon');

    const buttons = element.querySelectorAll('button');
    const header = element.querySelectorAll('th');

    const newIcon = getByTestId('bpm-tool-icon-new');
    const edgeIcon = getByTestId('bpm-tool-icon-edge');
    const deleteIcon = getByTestId('bpm-tool-icon-delete');
    const colorIcon = getByTestId('bpm-tool-icon-color');
    const zoomInIcon = getByTestId('bpm-tool-icon-zoomin');
    const zoomResetIcon = getByTestId('bpm-tool-icon-zoomreset');
    const zoomOutIcon = getByTestId('bpm-tool-icon-zoomout');

    // tools
    expect(newIcon).toHaveAttribute('title', 'Create new process');
    expect(newIcon).not.toHaveTextContent('Click here to create a process.');
    expect(edgeIcon).toHaveAttribute('title', 'Create new connection');
    expect(deleteIcon).toHaveAttribute('title', 'Delete selected element');
    expect(colorIcon).toHaveAttribute(
      'title',
      'Turn off conditional colorization',
    );
    expect(zoomInIcon).toHaveAttribute('title', 'Zoom in');
    expect(zoomResetIcon).toHaveAttribute('title', 'Reset zoom');
    expect(zoomOutIcon).toHaveAttribute('title', 'Zoom out');

    // process map

    // process 1
    expect(processes[0]).toHaveAttribute('cursor', 'grab');
    expect(processes[0]).toHaveTextContent('foo');
    expect(processes[0]).toHaveTextContent('bar');

    expect(circles[0]).toHaveAttribute('fill', '#fff');
    expect(circles[0]).toHaveAttribute('cx', '600');
    expect(circles[0]).toHaveAttribute('cy', '300');

    // process 2
    expect(processes[1]).toHaveAttribute('cursor', 'grab');
    expect(processes[1]).toHaveTextContent('lorem');
    expect(processes[1]).toHaveTextContent('ipsum');

    expect(circles[1]).toHaveAttribute('fill', '#fff');
    expect(circles[1]).toHaveAttribute('cx', '300');
    expect(circles[1]).toHaveAttribute('cy', '200');

    // edge
    expect(edges[0]).toHaveAttribute('x1', '600');
    expect(edges[0]).toHaveAttribute('x2', '300');
    expect(edges[0]).toHaveAttribute('y1', '300');
    expect(edges[0]).toHaveAttribute('y2', '200');
    expect(edges[0]).toHaveAttribute('fill', '#393637');

    // process panel
    expect(element).toHaveTextContent('No process selected');
    expect(icons[9]).toHaveAttribute('title', 'Edit process');

    expect(buttons[0]).toHaveAttribute('title', 'Add Selected Hosts');
    expect(buttons[0]).toHaveTextContent('Add Selected Hosts');

    expect(header[0]).toHaveTextContent('Host');
    expect(header[1]).toHaveTextContent('Severity');
    expect(header[2]).toHaveTextContent('Actions');

    expect(element).not.toHaveTextContent(
      'No hosts associated with this process.',
    );

    expect(gmp.user.renewSession).toHaveBeenCalled();
    expect(resultFunc).toHaveBeenCalled();
  });

  test('should render ProcessMapsPage with hosts', () => {
    const gmp = {
      hosts: {
        get: getHosts,
        getAll: getAllHosts,
      },
      tag: {
        get: getTag,
      },
      user: {
        getBusinessProcessMaps,
        renewSession,
      },
      settings: {manualUrl},
    };

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
      queryMocks: [queryMock],
    });

    const {element, getAllByTestId} = render(<ProcessMapsPage />);

    store.dispatch(getBusinessProcessMapsAction(processMaps));
    store.dispatch(
      entitiesLoadingActions.success(hosts, hostFilter1, hostFilter1),
    );
    store.dispatch(
      entitiesLoadingActions.success(hosts, hostFilter2, hostFilter2),
    );
    store.dispatch(
      entitiesLoadingActions.success(hosts, hostFilter3, hostFilter3),
    );

    const processes = getAllByTestId('process-node-group');
    const circles = getAllByTestId('process-node-circle');
    const edges = getAllByTestId('bpm-edge-line');

    const buttons = element.querySelectorAll('button');
    const header = element.querySelectorAll('th');

    // select process
    fireEvent.mouseDown(circles[0]);
    fireEvent.mouseUp(circles[0]);

    const icons = getAllByTestId('svg-icon');
    const detailsLinks = getAllByTestId('details-link');
    const progressBars = getAllByTestId('progressbar-box');

    // process map

    // process 1
    expect(processes[0]).toHaveAttribute('cursor', 'grab');
    expect(processes[0]).toHaveTextContent('foo');
    expect(processes[0]).toHaveTextContent('bar');

    expect(circles[0]).toHaveAttribute('fill', '#c83814');
    expect(circles[0]).toHaveAttribute('cx', '600');
    expect(circles[0]).toHaveAttribute('cy', '300');

    // process 2
    expect(processes[1]).toHaveAttribute('cursor', 'grab');
    expect(processes[1]).toHaveTextContent('lorem');
    expect(processes[1]).toHaveTextContent('ipsum');

    expect(circles[1]).toHaveAttribute('fill', '#c83814');
    expect(circles[1]).toHaveAttribute('cx', '300');
    expect(circles[1]).toHaveAttribute('cy', '200');

    // edge
    expect(edges[0]).toHaveAttribute('x1', '600');
    expect(edges[0]).toHaveAttribute('x2', '300');
    expect(edges[0]).toHaveAttribute('y1', '300');
    expect(edges[0]).toHaveAttribute('y2', '200');
    expect(edges[0]).toHaveAttribute('fill', '#393637');

    // process panel
    expect(element).toHaveTextContent('foo');
    expect(icons[9]).toHaveAttribute('title', 'Edit process');

    expect(buttons[0]).toHaveAttribute('title', 'Add Selected Hosts');
    expect(buttons[0]).toHaveTextContent('Add Selected Hosts');

    // Host Table

    // Headings
    expect(header[0]).toHaveTextContent('Host');
    expect(header[1]).toHaveTextContent('Severity');
    expect(header[2]).toHaveTextContent('Actions');

    // Row 1
    expect(detailsLinks[0]).toHaveAttribute('href', '/host/1234');
    expect(detailsLinks[0]).toHaveTextContent('123.456.78.910');
    expect(progressBars[0]).toHaveAttribute('title', 'Medium');
    expect(progressBars[0]).toHaveTextContent('5.0 (Medium)');
    expect(icons[10]).toHaveAttribute('title', 'Remove host from process');

    // Row 2
    expect(detailsLinks[1]).toHaveAttribute('href', '/host/5678');
    expect(detailsLinks[1]).toHaveTextContent('109.876.54.321');
    expect(progressBars[1]).toHaveAttribute('title', 'N/A');
    expect(progressBars[1]).toHaveTextContent('N/A');
    expect(icons[11]).toHaveAttribute('title', 'Remove host from process');

    expect(gmp.user.renewSession).toHaveBeenCalled();
    expect(resultFunc).toHaveBeenCalled();
  });

  test('should save map when drawing new edge', () => {
    const saveBusinessProcessMaps = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      hosts: {
        get: getHosts,
        getAll: getAllHosts,
      },
      tag: {
        get: getTag,
      },
      user: {
        getBusinessProcessMaps,
        saveBusinessProcessMaps,
        renewSession,
      },
      settings: {manualUrl},
    };

    const {render, store} = rendererWith({
      gmp,
      store: true,
      queryMocks: [queryMock],
    });

    const {getByTestId, getAllByTestId} = render(<ProcessMapsPage />);

    store.dispatch(getBusinessProcessMapsAction(processMaps));

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

    expect(gmp.user.renewSession).toHaveBeenCalled();
    expect(resultFunc).toHaveBeenCalled();
  });

  test('should save map after a process was moved', () => {
    const saveBusinessProcessMaps = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      hosts: {
        get: getHosts,
        getAll: getAllHosts,
      },
      tag: {
        get: getTag,
      },
      user: {
        getBusinessProcessMaps,
        saveBusinessProcessMaps,
        renewSession,
      },
      settings: {manualUrl},
    };

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
      queryMocks: [queryMock],
    });

    const {getAllByTestId} = render(<ProcessMapsPage />);

    store.dispatch(getBusinessProcessMapsAction(processMaps));

    const circles = getAllByTestId('process-node-circle');

    fireEvent.mouseDown(circles[0]);

    expect(saveBusinessProcessMaps).not.toHaveBeenCalled();

    fireEvent.mouseMove(circles[0]);

    expect(saveBusinessProcessMaps).not.toHaveBeenCalled();

    fireEvent.mouseUp(circles[0]);

    expect(saveBusinessProcessMaps).toHaveBeenCalled();

    expect(gmp.user.renewSession).toHaveBeenCalled();
    expect(resultFunc).toHaveBeenCalled();
  });
});
