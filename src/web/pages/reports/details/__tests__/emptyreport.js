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

import Capabilities from 'gmp/capabilities/capabilities';
import {setLocale} from 'gmp/locale/lang';

import {rendererWith, fireEvent} from 'web/utils/testing';

import EmptyReport from '../emptyreport';

setLocale('en');

const caps = new Capabilities(['everything']);
const wrongCaps = new Capabilities(['get_reports']);

describe('Empty Report tests', () => {
  test('should render empty report', () => {
    const onTargetEditClick = jest.fn();

    const {render} = rendererWith({
      capabilities: caps,
    });

    const {baseElement} = render(
      <EmptyReport
        hasTarget={true}
        status={'Done'}
        progress={0}
        onTargetEditClick={onTargetEditClick}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');

    // Should include
    expect(baseElement).toHaveTextContent(
      'The Report is empty. This can happen for the following reasons:',
    );

    expect(baseElement).toHaveTextContent(
      'The scan did not collect any results',
    );
    expect(icons[0]).toHaveTextContent('task.svg');
    expect(baseElement).toHaveTextContent(
      'If the scan got interrupted you can try to re-start the task.',
    );

    expect(baseElement).toHaveTextContent(
      'The target hosts could be regarded dead',
    );
    expect(icons[1]).toHaveTextContent('target.svg');
    expect(baseElement).toHaveTextContent(
      'You should change the Alive Test Method of the target for the next scan. However, if the target hosts are indeed dead, the scan duration might increase significantly.',
    );

    // Should not include
    expect(baseElement).not.toHaveTextContent(
      'The scan just started and no results have arrived yet',
    );
    expect(baseElement).not.toHaveTextContent(
      'The scan is still running and no results have arrived yet',
    );
    expect(baseElement).not.toHaveTextContent(
      'Just wait for results to arrive.',
    );
  });

  test('should render report for newly started task', () => {
    const onTargetEditClick = jest.fn();

    const {render} = rendererWith({
      capabilities: caps,
    });

    const {baseElement} = render(
      <EmptyReport
        hasTarget={true}
        status={'Running'}
        progress={1}
        onTargetEditClick={onTargetEditClick}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');

    expect(baseElement).toHaveTextContent(
      'The scan just started and no results have arrived yet',
    );
    expect(icons[0]).toHaveTextContent('refresh.svg');
    expect(baseElement).toHaveTextContent('Just wait for results to arrive.');
  });

  test('should render report for running task', () => {
    const onTargetEditClick = jest.fn();

    const {render} = rendererWith({
      capabilities: caps,
    });

    const {baseElement} = render(
      <EmptyReport
        hasTarget={true}
        status={'Running'}
        progress={50}
        onTargetEditClick={onTargetEditClick}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');

    expect(baseElement).toHaveTextContent(
      'The scan is still running and no results have arrived yet',
    );
    expect(icons[0]).toHaveTextContent('refresh.svg');
    expect(baseElement).toHaveTextContent('Just wait for results to arrive.');
  });

  test('should call click handler', () => {
    const onTargetEditClick = jest.fn();

    const {render} = rendererWith({
      capabilities: caps,
    });

    const {baseElement} = render(
      <EmptyReport
        hasTarget={true}
        status={'Done'}
        progress={0}
        onTargetEditClick={onTargetEditClick}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');

    expect(icons[1]).toHaveTextContent('target.svg');
    fireEvent.click(icons[1]);
    expect(onTargetEditClick).toHaveBeenCalled();
  });

  test('should not call click handler with wrong capabilities', () => {
    const onTargetEditClick = jest.fn();

    const {render} = rendererWith({
      capabilities: wrongCaps,
    });

    const {baseElement} = render(
      <EmptyReport
        hasTarget={true}
        status={'Done'}
        progress={0}
        onTargetEditClick={onTargetEditClick}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');

    expect(icons[1]).toHaveTextContent('target.svg');
    fireEvent.click(icons[1]);
    expect(onTargetEditClick).not.toHaveBeenCalled();
  });
});
