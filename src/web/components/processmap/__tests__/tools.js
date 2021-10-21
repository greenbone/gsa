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

import {render, fireEvent} from 'web/utils/testing';

import Tools from '../tools';

setLocale('en');

describe('Tools tests', () => {
  test('should render Tools', () => {
    const handleCreateProcessClick = jest.fn();
    const handleDrawEdgeClick = jest.fn();
    const handleDeleteClick = jest.fn();
    const handleToggleConditionalColorization = jest.fn();

    const {getByTestId} = render(
      <Tools
        applyConditionalColorization={true}
        drawIsActive={false}
        maxNumProcessesReached={false}
        maxZoomReached={false}
        minZoomReached={false}
        onCreateProcessClick={handleCreateProcessClick}
        onDeleteClick={handleDeleteClick}
        onDrawEdgeClick={handleDrawEdgeClick}
        onToggleConditionalColorization={handleToggleConditionalColorization}
      />,
    );

    const newIcon = getByTestId('bpm-tool-icon-new');
    const edgeIcon = getByTestId('bpm-tool-icon-edge');
    const deleteIcon = getByTestId('bpm-tool-icon-delete');
    const colorIcon = getByTestId('bpm-tool-icon-color');
    const zoomInIcon = getByTestId('bpm-tool-icon-zoomin');
    const zoomResetIcon = getByTestId('bpm-tool-icon-zoomreset');
    const zoomOutIcon = getByTestId('bpm-tool-icon-zoomout');

    expect(newIcon).toHaveAttribute('title', 'Create new process');

    expect(edgeIcon).toHaveAttribute('title', 'Create new connection');
    expect(edgeIcon).not.toHaveStyleRule('background-color', '#66c430');

    expect(deleteIcon).toHaveAttribute('title', 'Delete selected element');

    expect(colorIcon).toHaveAttribute(
      'title',
      'Turn off conditional colorization',
    );
    expect(colorIcon).toHaveStyleRule('background-color', '#66c430');

    expect(zoomInIcon).toHaveAttribute('title', 'Zoom in');
    expect(zoomResetIcon).toHaveAttribute('title', 'Reset zoom');
    expect(zoomOutIcon).toHaveAttribute('title', 'Zoom out');
  });

  test('should render active icons', () => {
    const handleCreateProcessClick = jest.fn();
    const handleDrawEdgeClick = jest.fn();
    const handleDeleteClick = jest.fn();
    const handleToggleConditionalColorization = jest.fn();

    const {getByTestId} = render(
      <Tools
        applyConditionalColorization={false}
        drawIsActive={true}
        maxNumProcessesReached={false}
        maxZoomReached={false}
        minZoomReached={false}
        onCreateProcessClick={handleCreateProcessClick}
        onDeleteClick={handleDeleteClick}
        onDrawEdgeClick={handleDrawEdgeClick}
        onToggleConditionalColorization={handleToggleConditionalColorization}
      />,
    );

    const newIcon = getByTestId('bpm-tool-icon-new');
    const edgeIcon = getByTestId('bpm-tool-icon-edge');
    const deleteIcon = getByTestId('bpm-tool-icon-delete');
    const colorIcon = getByTestId('bpm-tool-icon-color');
    const zoomInIcon = getByTestId('bpm-tool-icon-zoomin');
    const zoomResetIcon = getByTestId('bpm-tool-icon-zoomreset');
    const zoomOutIcon = getByTestId('bpm-tool-icon-zoomout');

    expect(newIcon).toHaveAttribute('title', 'Create new process');

    expect(edgeIcon).toHaveAttribute('title', 'Create new connection');
    expect(edgeIcon).toHaveStyleRule('background-color', '#66c430');

    expect(deleteIcon).toHaveAttribute('title', 'Delete selected element');

    expect(colorIcon).toHaveAttribute(
      'title',
      'Turn on conditional colorization',
    );
    expect(colorIcon).not.toHaveStyleRule('background-color', '#66c430');

    expect(zoomInIcon).not.toHaveStyleRule('background-color', '#66c430');
    expect(zoomResetIcon).not.toHaveStyleRule('background-color', '#66c430');
    expect(zoomOutIcon).not.toHaveStyleRule('background-color', '#66c430');
  });

  test('should call click handler', () => {
    const handleCreateProcessClick = jest.fn();
    const handleDrawEdgeClick = jest.fn();
    const handleDeleteClick = jest.fn();
    const handleToggleConditionalColorization = jest.fn();
    const handleZoomChangeClick = jest.fn();

    const {getByTestId} = render(
      <Tools
        applyConditionalColorization={true}
        drawIsActive={false}
        maxNumProcessesReached={false}
        maxZoomReached={false}
        minZoomReached={false}
        onCreateProcessClick={handleCreateProcessClick}
        onDeleteClick={handleDeleteClick}
        onDrawEdgeClick={handleDrawEdgeClick}
        onToggleConditionalColorization={handleToggleConditionalColorization}
        onZoomChangeClick={handleZoomChangeClick}
      />,
    );

    const newIcon = getByTestId('bpm-tool-icon-new');
    const edgeIcon = getByTestId('bpm-tool-icon-edge');
    const deleteIcon = getByTestId('bpm-tool-icon-delete');
    const colorIcon = getByTestId('bpm-tool-icon-color');
    const zoomInIcon = getByTestId('bpm-tool-icon-zoomin');
    const zoomResetIcon = getByTestId('bpm-tool-icon-zoomreset');
    const zoomOutIcon = getByTestId('bpm-tool-icon-zoomout');

    expect(newIcon).toHaveAttribute('title', 'Create new process');
    fireEvent.click(newIcon);
    expect(handleCreateProcessClick).toHaveBeenCalled();

    expect(edgeIcon).toHaveAttribute('title', 'Create new connection');
    fireEvent.click(edgeIcon);
    expect(handleDrawEdgeClick).toHaveBeenCalled();

    expect(deleteIcon).toHaveAttribute('title', 'Delete selected element');
    fireEvent.click(deleteIcon);
    expect(handleDeleteClick).toHaveBeenCalled();

    expect(colorIcon).toHaveAttribute(
      'title',
      'Turn off conditional colorization',
    );
    fireEvent.click(colorIcon);
    expect(handleToggleConditionalColorization).toHaveBeenCalled();

    expect(zoomInIcon).toHaveAttribute('title', 'Zoom in');
    fireEvent.click(zoomInIcon);
    expect(handleZoomChangeClick).toHaveBeenCalledWith('+');

    expect(zoomResetIcon).toHaveAttribute('title', 'Reset zoom');
    fireEvent.click(zoomResetIcon);
    expect(handleZoomChangeClick).toHaveBeenCalledWith('0');

    expect(zoomOutIcon).toHaveAttribute('title', 'Zoom out');
    fireEvent.click(zoomOutIcon);
    expect(handleZoomChangeClick).toHaveBeenCalledWith('-');
  });

  test('should handle max and min props', () => {
    const handleCreateProcessClick = jest.fn();
    const handleDrawEdgeClick = jest.fn();
    const handleDeleteClick = jest.fn();
    const handleToggleConditionalColorization = jest.fn();
    const handleZoomChangeClick = jest.fn();

    const {getByTestId} = render(
      <Tools
        applyConditionalColorization={true}
        drawIsActive={false}
        maxNumProcessesReached={true}
        maxZoomReached={true}
        minZoomReached={true}
        onCreateProcessClick={handleCreateProcessClick}
        onDeleteClick={handleDeleteClick}
        onDrawEdgeClick={handleDrawEdgeClick}
        onToggleConditionalColorization={handleToggleConditionalColorization}
        onZoomChangeClick={handleZoomChangeClick}
      />,
    );

    const newIcon = getByTestId('bpm-tool-icon-new');
    const zoomInIcon = getByTestId('bpm-tool-icon-zoomin');
    const zoomOutIcon = getByTestId('bpm-tool-icon-zoomout');

    expect(newIcon).toHaveAttribute(
      'title',
      'Maximum number of 50 processes reached',
    );
    fireEvent.click(newIcon);
    expect(handleCreateProcessClick).not.toHaveBeenCalled();

    expect(zoomInIcon).toHaveAttribute('title', 'Zoom in');
    fireEvent.click(zoomInIcon);
    expect(handleZoomChangeClick).not.toHaveBeenCalled();

    expect(zoomOutIcon).toHaveAttribute('title', 'Zoom out');
    fireEvent.click(zoomOutIcon);
    expect(handleZoomChangeClick).not.toHaveBeenCalled();
  });
});
