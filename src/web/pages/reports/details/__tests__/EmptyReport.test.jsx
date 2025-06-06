/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import EmptyReport from 'web/pages/reports/details/EmptyReport';

const caps = new Capabilities(['everything']);
const wrongCaps = new Capabilities(['get_reports']);

describe('Empty Report tests', () => {
  test('should render empty report', () => {
    const onTargetEditClick = testing.fn();

    const {render} = rendererWith({
      capabilities: caps,
    });

    const {baseElement} = render(
      <EmptyReport
        hasTarget={true}
        progress={0}
        status={'Done'}
        onTargetEditClick={onTargetEditClick}
      />,
    );

    // Should include
    expect(baseElement).toHaveTextContent(
      'The Report is empty. This can happen for the following reasons:',
    );

    expect(baseElement).toHaveTextContent(
      'The scan did not collect any results',
    );
    expect(baseElement).toHaveTextContent(
      'If the scan got interrupted you can try to re-start the task.',
    );

    expect(baseElement).toHaveTextContent(
      'The target hosts could be regarded dead',
    );
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
    const onTargetEditClick = testing.fn();

    const {render} = rendererWith({
      capabilities: caps,
    });

    const {baseElement} = render(
      <EmptyReport
        hasTarget={true}
        progress={1}
        status={'Running'}
        onTargetEditClick={onTargetEditClick}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');
    expect(icons.length).toEqual(1);

    expect(baseElement).toHaveTextContent(
      'The scan just started and no results have arrived yet',
    );
    expect(baseElement).toHaveTextContent('Just wait for results to arrive.');
  });

  test('should render report for running task', () => {
    const onTargetEditClick = testing.fn();

    const {render} = rendererWith({
      capabilities: caps,
    });

    const {baseElement} = render(
      <EmptyReport
        hasTarget={true}
        progress={50}
        status={'Running'}
        onTargetEditClick={onTargetEditClick}
      />,
    );

    expect(baseElement).toHaveTextContent(
      'The scan is still running and no results have arrived yet',
    );
    expect(baseElement).toHaveTextContent('Just wait for results to arrive.');
  });

  test('should call click handler', () => {
    const onTargetEditClick = testing.fn();

    const {render} = rendererWith({
      capabilities: caps,
    });

    const {baseElement} = render(
      <EmptyReport
        hasTarget={true}
        progress={0}
        status={'Done'}
        onTargetEditClick={onTargetEditClick}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');

    fireEvent.click(icons[1]);
    expect(onTargetEditClick).toHaveBeenCalled();
  });

  test('should not call click handler with wrong capabilities', () => {
    const onTargetEditClick = testing.fn();

    const {render} = rendererWith({
      capabilities: wrongCaps,
    });

    const {baseElement} = render(
      <EmptyReport
        hasTarget={true}
        progress={0}
        status={'Done'}
        onTargetEditClick={onTargetEditClick}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');

    fireEvent.click(icons[1]);
    expect(onTargetEditClick).not.toHaveBeenCalled();
  });
});
