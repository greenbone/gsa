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
    expect(colorIcon).not.toHaveStyleRule('background-color', '#66c430');

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
    expect(colorIcon).toHaveStyleRule('background-color', '#66c430');

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
});
