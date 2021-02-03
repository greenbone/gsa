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

import {setLocale} from 'gmp/locale/lang';

import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';

import {rendererWith, fireEvent} from 'web/utils/testing';

import {getMockProcessMap} from '../__mocks__/mockprocessmap';

import ProcessPanel from '../processpanel';

setLocale('en');

const {processes} = getMockProcessMap();
const {21: process1, 22: process2} = processes;

const hosts = [
  {name: '123.456.78.910', id: '1234', severity: 5},
  {name: '109.876.54.321', id: '5678', severity: undefined},
];

const results = [
  {id: '123', severity: 4, nvt: {name: 'bar', oid: '1337'}},
  {id: '456', severity: 8, nvt: {name: 'lorem', oid: '7353'}},
  {id: '789', severity: 1, nvt: {oid: '987'}},
];

let getAllHosts;
let getResults;

beforeEach(() => {
  getAllHosts = jest.fn().mockResolvedValue({
    data: [hosts],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });
  getResults = jest.fn().mockResolvedValue({
    data: results,
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });
});

describe('ProcessPanel tests', () => {
  test('should render ProcessPanel', () => {
    const handleAddHosts = jest.fn();
    const handleDeleteHost = jest.fn();
    const handleEditProcessClick = jest.fn();
    const handleSelectHost = jest.fn();

    const gmp = {
      hosts: {
        getAll: getAllHosts,
      },
    };

    const {render} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
    });

    const {element, getAllByTestId} = render(
      <ProcessPanel
        isLoadingHosts={false}
        onAddHosts={handleAddHosts}
        onDeleteHost={handleDeleteHost}
        onSelectHost={handleSelectHost}
        onEditProcessClick={handleEditProcessClick}
      />,
    );

    const header = element.querySelectorAll('th');
    const buttons = element.querySelectorAll('button');
    const icons = getAllByTestId('svg-icon');

    // Title
    expect(element).toHaveTextContent('No process selected');
    expect(icons[0]).toHaveAttribute('title', 'Edit process');

    // Add Hosts
    expect(buttons[0]).toHaveAttribute('title', 'Add Selected Hosts');
    expect(buttons[0]).toHaveTextContent('Add Selected Hosts');

    // Host Table
    expect(header[0]).toHaveTextContent('Host');
    expect(header[1]).toHaveTextContent('Name');
    expect(header[2]).toHaveTextContent('Severity');
    expect(header[3]).toHaveTextContent('Actions');

    expect(element).not.toHaveTextContent(
      'No hosts associated with this process.',
    );

    // Result Table
    expect(header[4]).toHaveTextContent('Result');
    expect(header[5]).toHaveTextContent('Severity');

    expect(element).toHaveTextContent('No host selected.');
  });

  test('should render ProcessPanel with selected element without hosts', () => {
    const handleAddHosts = jest.fn();
    const handleDeleteHost = jest.fn();
    const handleEditProcessClick = jest.fn();
    const handleSelectHost = jest.fn();

    const gmp = {
      hosts: {
        getAll: getAllHosts,
      },
    };

    const {render} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
    });

    const {element, getAllByTestId} = render(
      <ProcessPanel
        element={process2}
        hostList={[]}
        isLoadingHosts={false}
        onAddHosts={handleAddHosts}
        onDeleteHost={handleDeleteHost}
        onSelectHost={handleSelectHost}
        onEditProcessClick={handleEditProcessClick}
      />,
    );

    const header = element.querySelectorAll('th');
    const buttons = element.querySelectorAll('button');
    const icons = getAllByTestId('svg-icon');

    // Title
    expect(element).toHaveTextContent('lorem');
    expect(icons[0]).toHaveAttribute('title', 'Edit process');

    // Add Hosts
    expect(buttons[0]).toHaveAttribute('title', 'Add Selected Hosts');
    expect(buttons[0]).toHaveTextContent('Add Selected Hosts');

    // Host Table
    expect(header[0]).toHaveTextContent('Host');
    expect(header[1]).toHaveTextContent('Name');
    expect(header[2]).toHaveTextContent('Severity');
    expect(header[3]).toHaveTextContent('Actions');

    expect(element).toHaveTextContent('No hosts associated with this process.');
  });

  test('should render ProcessPanel with selected element with hosts', () => {
    const handleAddHosts = jest.fn();
    const handleDeleteHost = jest.fn();
    const handleEditProcessClick = jest.fn();
    const handleSelectHost = jest.fn();

    const gmp = {
      hosts: {
        getAll: getAllHosts,
      },
    };

    const {render} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
    });

    const {element, getAllByTestId} = render(
      <ProcessPanel
        element={process1}
        hostList={hosts}
        isLoadingHosts={false}
        onAddHosts={handleAddHosts}
        onDeleteHost={handleDeleteHost}
        onSelectHost={handleSelectHost}
        onEditProcessClick={handleEditProcessClick}
      />,
    );

    const header = element.querySelectorAll('th');
    const buttons = element.querySelectorAll('button');
    const detailsLinks = getAllByTestId('details-link');
    const icons = getAllByTestId('svg-icon');
    const progressBars = getAllByTestId('progressbar-box');

    // Title
    expect(element).toHaveTextContent('foo');
    expect(icons[0]).toHaveAttribute('title', 'Edit process');

    // Add Hosts
    expect(buttons[0]).toHaveAttribute('title', 'Add Selected Hosts');
    expect(buttons[0]).toHaveTextContent('Add Selected Hosts');

    // Host Table

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
    expect(icons[1]).toHaveAttribute('title', 'Remove host from process');

    // Row 2
    expect(detailsLinks[1]).toHaveAttribute('href', '/host/5678');
    expect(detailsLinks[1]).toHaveTextContent('details.svg');
    expect(progressBars[1]).toHaveAttribute('title', 'N/A');
    expect(progressBars[1]).toHaveTextContent('N/A');
    expect(icons[3]).toHaveAttribute('title', 'Remove host from process');
  });

  test('should render ProcessPanel with selected element with hosts and results', () => {
    const handleAddHosts = jest.fn();
    const handleDeleteHost = jest.fn();
    const handleSelectHost = jest.fn();
    const handleEditProcessClick = jest.fn();

    const gmp = {
      hosts: {
        getAll: getAllHosts,
      },
      results: {
        get: getResults,
      },
    };

    const {render} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
    });

    const {element, getAllByTestId} = render(
      <ProcessPanel
        element={process1}
        hostList={hosts}
        resultList={results}
        isLoadingHosts={false}
        onAddHosts={handleAddHosts}
        onDeleteHost={handleDeleteHost}
        onSelectHost={handleSelectHost}
        onEditProcessClick={handleEditProcessClick}
      />,
    );

    const header = element.querySelectorAll('th');
    const buttons = element.querySelectorAll('button');
    const detailsLinks = getAllByTestId('details-link');
    const icons = getAllByTestId('svg-icon');
    const progressBars = getAllByTestId('progressbar-box');

    // Title
    expect(element).toHaveTextContent('foo');
    expect(icons[0]).toHaveAttribute('title', 'Edit process');

    // Add Hosts
    expect(buttons[0]).toHaveAttribute('title', 'Add Selected Hosts');
    expect(buttons[0]).toHaveTextContent('Add Selected Hosts');

    // Host Table

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
    expect(icons[1]).toHaveAttribute('title', 'Remove host from process');

    // Row 2
    expect(detailsLinks[1]).toHaveAttribute('href', '/host/5678');
    expect(detailsLinks[1]).toHaveTextContent('details.svg');
    expect(progressBars[1]).toHaveAttribute('title', 'N/A');
    expect(progressBars[1]).toHaveTextContent('N/A');
    expect(icons[3]).toHaveAttribute('title', 'Remove host from process');

    // Results Table

    // Headings
    expect(header[4]).toHaveTextContent('Result');
    expect(header[5]).toHaveTextContent('Severity');

    // Row 1
    expect(detailsLinks[2]).toHaveAttribute('href', '/result/456');
    expect(detailsLinks[2]).toHaveTextContent('lorem');
    expect(progressBars[2]).toHaveAttribute('title', 'High');
    expect(progressBars[2]).toHaveTextContent('8.0 (High)');

    // Row 2
    expect(detailsLinks[3]).toHaveAttribute('href', '/result/123');
    expect(detailsLinks[3]).toHaveTextContent('bar');
    expect(progressBars[3]).toHaveAttribute('title', 'Medium');
    expect(progressBars[3]).toHaveTextContent('4.0 (Medium)');

    // Row 3
    expect(detailsLinks[4]).toHaveAttribute('href', '/result/789');
    expect(detailsLinks[4]).toHaveTextContent('987');
    expect(progressBars[4]).toHaveAttribute('title', 'Low');
    expect(progressBars[4]).toHaveTextContent('1.0 (Low)');
  });

  test('should call click handler', () => {
    const handleAddHosts = jest.fn();
    const handleDeleteHost = jest.fn();
    const handleEditProcessClick = jest.fn();
    const handleSelectHost = jest.fn();

    const gmp = {
      hosts: {
        getAll: getAllHosts,
      },
    };

    const {render} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
    });

    const {element, getAllByTestId} = render(
      <ProcessPanel
        element={process1}
        hostList={hosts}
        isLoadingHosts={false}
        onAddHosts={handleAddHosts}
        onDeleteHost={handleDeleteHost}
        onSelectHost={handleSelectHost}
        onEditProcessClick={handleEditProcessClick}
      />,
    );

    const buttons = element.querySelectorAll('button');
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Edit process');
    fireEvent.click(icons[0]);
    expect(handleEditProcessClick).toHaveBeenCalled();

    expect(buttons[0]).toHaveAttribute('title', 'Add Selected Hosts');
    fireEvent.click(buttons[0]);
    expect(handleAddHosts).toHaveBeenCalledWith([]);

    expect(icons[1]).toHaveAttribute('title', 'Remove host from process');
    fireEvent.click(icons[1]);
    expect(handleDeleteHost).toHaveBeenCalledWith(hosts[0].id);
  });

  test('should not call click handler if no process is selected', () => {
    const handleAddHosts = jest.fn();
    const handleDeleteHost = jest.fn();
    const handleEditProcessClick = jest.fn();
    const handleSelectHost = jest.fn();

    const gmp = {
      hosts: {
        getAll: getAllHosts,
      },
    };

    const {render} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
    });

    const {element, getAllByTestId} = render(
      <ProcessPanel
        isLoadingHosts={false}
        onAddHosts={handleAddHosts}
        onDeleteHost={handleDeleteHost}
        onSelectHost={handleSelectHost}
        onEditProcessClick={handleEditProcessClick}
      />,
    );

    const buttons = element.querySelectorAll('button');
    const icons = getAllByTestId('svg-icon');

    expect(icons.length).toBe(1);

    expect(icons[0]).toHaveAttribute('title', 'Edit process');
    fireEvent.click(icons[0]);
    expect(handleEditProcessClick).not.toHaveBeenCalled();

    expect(buttons[0]).toHaveAttribute('title', 'Add Selected Hosts');
    fireEvent.click(buttons[0]);
    expect(handleAddHosts).not.toHaveBeenCalled();
  });

  test('should allow pagination', () => {
    const handleAddHosts = jest.fn();
    const handleDeleteHost = jest.fn();
    const handleEditProcessClick = jest.fn();
    const handleSelectHost = jest.fn();

    const hosts2 = [
      {id: '01', severity: 10},
      {id: '02', severity: 9.9},
      {id: '03', severity: 9.8},
      {id: '04', severity: 9.7},
      {id: '05', severity: 9.6},
      {id: '06', severity: 9.5},
      {id: '07', severity: 9.4},
      {id: '08', severity: 9.3},
      {id: '09', severity: 9.2},
      {id: '10', severity: 9.1},
      {id: '11', severity: 8.9},
      {id: '12', severity: 8.8},
      {id: '13', severity: 8.7},
      {id: '14', severity: 8.6},
      {id: '15', severity: 8.5},
      {id: '16', severity: 8.4},
      {id: '17', severity: 8.3},
      {id: '18', severity: 8.2},
      {id: '19', severity: 8.1},
      {id: '20', severity: 7.9},
      {id: '21', severity: 8.0},
    ];

    const getAllHosts2 = jest.fn().mockResolvedValue({
      data: [hosts2],
      meta: {
        filter: Filter.fromString(),
        counts: new CollectionCounts(),
      },
    });

    const gmp = {
      hosts: {
        getAll: getAllHosts2,
      },
    };

    const {render} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
    });

    const {element, getAllByTestId} = render(
      <ProcessPanel
        element={process1}
        hostList={hosts2}
        isLoadingHosts={false}
        onAddHosts={handleAddHosts}
        onDeleteHost={handleDeleteHost}
        onSelectHost={handleSelectHost}
        onEditProcessClick={handleEditProcessClick}
      />,
    );

    const detailsLinks = getAllByTestId('details-link');
    let icons = getAllByTestId('svg-icon');

    // 1. Page
    expect(detailsLinks[0]).toHaveAttribute('href', '/host/01');
    expect(element).toHaveTextContent('1 - 10 of 21');

    expect(icons[23]).toHaveAttribute('title', 'Next');
    fireEvent.click(icons[23]);

    // 2. Page
    icons = getAllByTestId('svg-icon');

    expect(detailsLinks[0]).toHaveAttribute('href', '/host/11');
    expect(element).toHaveTextContent('11 - 20 of 21');

    expect(icons[23]).toHaveAttribute('title', 'Next');
    fireEvent.click(icons[23]);

    // 3. Page
    icons = getAllByTestId('svg-icon');

    expect(detailsLinks[0]).toHaveAttribute('href', '/host/20');
    expect(element).toHaveTextContent('21 - 21 of 21');

    expect(icons[3]).toHaveAttribute('title', 'First');
    fireEvent.click(icons[3]);

    // 1. Page
    icons = getAllByTestId('svg-icon');

    expect(detailsLinks[0]).toHaveAttribute('href', '/host/01');
    expect(element).toHaveTextContent('1 - 10 of 21');

    expect(icons[24]).toHaveAttribute('title', 'Last');
    fireEvent.click(icons[24]);

    // 3. Page
    icons = getAllByTestId('svg-icon');

    expect(detailsLinks[0]).toHaveAttribute('href', '/host/20');
    expect(element).toHaveTextContent('21 - 21 of 21');

    expect(icons[4]).toHaveAttribute('title', 'Previous');
    fireEvent.click(icons[4]);

    // 2. Page
    icons = getAllByTestId('svg-icon');

    expect(detailsLinks[0]).toHaveAttribute('href', '/host/11');
    expect(element).toHaveTextContent('11 - 20 of 21');
    // });
  });
});
