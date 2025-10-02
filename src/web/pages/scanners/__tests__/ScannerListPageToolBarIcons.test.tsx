/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith, fireEvent} from 'web/testing';
import Features from 'gmp/capabilities/features';
import ScannerListPageToolBarIcons from 'web/pages/scanners/ScannerListPageToolBarIcons';

describe('ScannerListPageToolBarIcons tests', () => {
  test('should render Manual icons', () => {
    const onScannerCreateClick = testing.fn();
    const gmp = {
      settings: {
        enableGreenboneSensor: false,
      },
    };
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      features: new Features(['ENABLE_AGENTS']),
    });
    render(
      <ScannerListPageToolBarIcons
        onScannerCreateClick={onScannerCreateClick}
      />,
    );

    expect(screen.getByTitle('Help: Scanners')).toBeInTheDocument();
  });

  test('should render New icon and call create handle ', () => {
    const onScannerCreateClick = testing.fn();
    const gmp = {
      settings: {
        enableGreenboneSensor: true,
        manualUrl: 'https://example.com/manual',
      },
    };
    const {render} = rendererWith({
      capabilities: true,
      gmp,
    });
    render(
      <ScannerListPageToolBarIcons
        onScannerCreateClick={onScannerCreateClick}
      />,
    );

    const newIcon = screen.getByTitle('New Scanner');
    expect(newIcon).toBeInTheDocument();

    fireEvent.click(newIcon);
    expect(onScannerCreateClick).toHaveBeenCalledWith();
    expect(screen.getByRole('link', {name: 'Help Icon'})).toHaveAttribute(
      'href',
      'https://example.com/manual/en/scanning.html#managing-scanners',
    );
  });

  test('should not render New icon if no create capability', () => {
    const onScannerCreateClick = testing.fn();
    const gmp = {
      settings: {
        enableGreenboneSensor: false,
      },
    };
    const {render} = rendererWith({
      capabilities: false,
      features: new Features(['ENABLE_AGENTS']),
      gmp,
    });
    render(
      <ScannerListPageToolBarIcons
        onScannerCreateClick={onScannerCreateClick}
      />,
    );

    expect(screen.queryByTitle('New Scanner')).not.toBeInTheDocument();
  });

  test('should not render New icon if Greenbone Sensor and Agents are disabled', () => {
    const gmp = {
      settings: {
        enableGreenboneSensor: false,
      },
    };
    const onScannerCreateClick = testing.fn();
    const {render} = rendererWith({
      capabilities: true,
      gmp,
    });
    render(
      <ScannerListPageToolBarIcons
        onScannerCreateClick={onScannerCreateClick}
      />,
    );

    expect(screen.queryByTitle('New Scanner')).not.toBeInTheDocument();
  });
});
