/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import InfoTip from 'web/components/info-tip/InfoTip';

describe('InfoTip tests', () => {
  test('should render InfoTip with default aria-label', () => {
    render(<InfoTip>Test content</InfoTip>);

    expect(screen.getByLabelText('More information')).toBeInTheDocument();
  });

  test('should render with custom aria-label', () => {
    render(<InfoTip ariaLabel="Custom help text">Test content</InfoTip>);

    expect(screen.getByLabelText('Custom help text')).toBeInTheDocument();
  });

  test('should apply custom data-testid to wrapper', () => {
    render(<InfoTip dataTestId="custom-info">Test content</InfoTip>);

    const wrapper = screen.getByTestId('custom-info');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.tagName).toBe('SECTION');
  });

  test.each(['top', 'bottom', 'left', 'right'])(
    'should accept position %s',
    position => {
      render(
        <InfoTip position={position as 'top' | 'bottom' | 'left' | 'right'}>
          Test content
        </InfoTip>,
      );

      expect(screen.getByLabelText('More information')).toBeInTheDocument();
    },
  );

  test('should render with children content', () => {
    render(<InfoTip>Test content</InfoTip>);

    expect(screen.getByLabelText('More information')).toBeInTheDocument();
  });

  test('should render multiline content', () => {
    render(
      <InfoTip>
        Line 1{'\n'}Line 2{'\n'}Line 3
      </InfoTip>,
    );

    expect(screen.getByLabelText('More information')).toBeInTheDocument();
  });

  test('should render as a section element', () => {
    render(<InfoTip>Test content</InfoTip>);

    const section = screen.getByLabelText('More information');
    expect(section).toBeInTheDocument();
    expect(section.tagName).toBe('SECTION');
  });
});
