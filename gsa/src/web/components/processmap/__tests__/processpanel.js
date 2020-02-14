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

import {rendererWith, fireEvent} from 'web/utils/testing';

import {getMockProcessMap} from './processmap';

import ProcessPanel from '../processpanel';

setLocale('en');
const {processes} = getMockProcessMap();
const {'21': process1, '22': process2} = processes;

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

describe('ProcessPanel tests', () => {
  test('should render ProcessPanel', () => {
    const handleAddHosts = jest.fn();
    const handleDeleteHost = jest.fn();
    const handleEditProcessClick = jest.fn();

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
    expect(header[1]).toHaveTextContent('Severity');
    expect(header[2]).toHaveTextContent('Actions');

    expect(element).not.toHaveTextContent(
      'No hosts associated with this process.',
    );
  });

  test('should render ProcessPanel with selected element without hosts', () => {
    const handleAddHosts = jest.fn();
    const handleDeleteHost = jest.fn();
    const handleEditProcessClick = jest.fn();

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
    expect(header[1]).toHaveTextContent('Severity');
    expect(header[2]).toHaveTextContent('Actions');

    expect(element).toHaveTextContent('No hosts associated with this process.');
  });

  test('should render ProcessPanel with selected element with hosts', () => {
    const handleAddHosts = jest.fn();
    const handleDeleteHost = jest.fn();
    const handleEditProcessClick = jest.fn();

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
    expect(header[1]).toHaveTextContent('Severity');
    expect(header[2]).toHaveTextContent('Actions');

    // Row 1
    expect(detailsLinks[0]).toHaveAttribute('href', '/host/1234');
    expect(detailsLinks[0]).toHaveTextContent('123.456.78.910');
    expect(progressBars[0]).toHaveAttribute('title', 'Medium');
    expect(progressBars[0]).toHaveTextContent('5.0 (Medium)');
    expect(icons[1]).toHaveAttribute('title', 'Remove host from process');

    // Row 2
    expect(detailsLinks[1]).toHaveAttribute('href', '/host/5678');
    expect(detailsLinks[1]).toHaveTextContent('109.876.54.321');
    expect(progressBars[1]).toHaveAttribute('title', 'N/A');
    expect(progressBars[1]).toHaveTextContent('N/A');
    expect(icons[2]).toHaveAttribute('title', 'Remove host from process');
  });

  test('should call click handler', () => {
    const handleAddHosts = jest.fn();
    const handleDeleteHost = jest.fn();
    const handleEditProcessClick = jest.fn();

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

    const hosts2 = [
      {id: '01', severity: '10'},
      {id: '02', severity: '9'},
      {id: '03', severity: '9'},
      {id: '04', severity: '9'},
      {id: '05', severity: '9'},
      {id: '06', severity: '9'},
      {id: '07', severity: '9'},
      {id: '08', severity: '9'},
      {id: '09', severity: '9'},
      {id: '10', severity: '9'},
      {id: '11', severity: '9'},
      {id: '12', severity: '9'},
      {id: '13', severity: '9'},
      {id: '14', severity: '9'},
      {id: '15', severity: '9'},
      {id: '16', severity: '9'},
      {id: '17', severity: '9'},
      {id: '18', severity: '9'},
      {id: '19', severity: '9'},
      {id: '20', severity: '9'},
      {id: '21', severity: '9'},
      {id: '22', severity: '9'},
      {id: '23', severity: '9'},
      {id: '24', severity: '9'},
      {id: '25', severity: '9'},
      {id: '26', severity: '9'},
      {id: '27', severity: '9'},
      {id: '28', severity: '9'},
      {id: '29', severity: '9'},
      {id: '30', severity: '9'},
      {id: '31', severity: '5'},
      {id: '32', severity: '4'},
      {id: '33', severity: '4'},
      {id: '34', severity: '4'},
      {id: '35', severity: '4'},
      {id: '36', severity: '4'},
      {id: '37', severity: '4'},
      {id: '38', severity: '4'},
      {id: '39', severity: '4'},
      {id: '40', severity: '4'},
      {id: '41', severity: '4'},
      {id: '42', severity: '4'},
      {id: '43', severity: '4'},
      {id: '44', severity: '4'},
      {id: '45', severity: '4'},
      {id: '46', severity: '4'},
      {id: '47', severity: '4'},
      {id: '48', severity: '4'},
      {id: '49', severity: '4'},
      {id: '50', severity: '4'},
      {id: '51', severity: '4'},
      {id: '52', severity: '4'},
      {id: '53', severity: '4'},
      {id: '54', severity: '4'},
      {id: '55', severity: '4'},
      {id: '56', severity: '4'},
      {id: '57', severity: '4'},
      {id: '58', severity: '4'},
      {id: '59', severity: '4'},
      {id: '60', severity: '4'},
      {id: '61', severity: '0'},
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
        onEditProcessClick={handleEditProcessClick}
      />,
    );

    const detailsLinks = getAllByTestId('details-link');
    let icons = getAllByTestId('svg-icon');

    // 1. Page
    expect(detailsLinks[0]).toHaveAttribute('href', '/host/01');
    expect(element).toHaveTextContent('1 - 30 of 61');

    expect(icons[33]).toHaveAttribute('title', 'Next');
    fireEvent.click(icons[33]);

    // 2. Page
    icons = getAllByTestId('svg-icon');

    expect(detailsLinks[0]).toHaveAttribute('href', '/host/31');
    expect(element).toHaveTextContent('31 - 60 of 61');

    expect(icons[33]).toHaveAttribute('title', 'Next');
    fireEvent.click(icons[33]);

    // 3. Page
    icons = getAllByTestId('svg-icon');

    expect(detailsLinks[0]).toHaveAttribute('href', '/host/61');
    expect(element).toHaveTextContent('61 - 61 of 61');

    expect(icons[2]).toHaveAttribute('title', 'First');
    fireEvent.click(icons[2]);

    // 1. Page
    icons = getAllByTestId('svg-icon');

    expect(detailsLinks[0]).toHaveAttribute('href', '/host/01');
    expect(element).toHaveTextContent('1 - 30 of 61');

    expect(icons[34]).toHaveAttribute('title', 'Last');
    fireEvent.click(icons[34]);

    // 3. Page
    icons = getAllByTestId('svg-icon');

    expect(detailsLinks[0]).toHaveAttribute('href', '/host/61');
    expect(element).toHaveTextContent('61 - 61 of 61');

    expect(icons[3]).toHaveAttribute('title', 'Previous');
    fireEvent.click(icons[3]);

    // 2. Page
    icons = getAllByTestId('svg-icon');

    expect(detailsLinks[0]).toHaveAttribute('href', '/host/31');
    expect(element).toHaveTextContent('31 - 60 of 61');
  });
});
