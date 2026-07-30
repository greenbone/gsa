/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import {type SolutionTypeValue} from 'gmp/models/nvt';
import SolutionType from 'web/components/icon/SolutionTypeIcon';

describe('SolutionType component tests', () => {
  const typesWithTitles: [SolutionTypeValue, string][] = [
    ['Workaround', 'Workaround'],
    ['Mitigation', 'Mitigation'],
    ['VendorFix', 'Vendorfix'],
    ['NoneAvailable', 'None available'],
    ['WillNotFix', 'Will not fix'],
  ];

  test.each(typesWithTitles)(
    'should render the icon with title for type "%s"',
    (type, title) => {
      render(<SolutionType type={type} />);

      expect(screen.getByTitle(title)).toBeInTheDocument();
    },
  );

  test('should render the unknown icon for undefined type', () => {
    render(<SolutionType />);

    expect(screen.getByTitle('')).toBeInTheDocument();
  });

  test('should render the unknown icon for an unrecognized type', () => {
    render(<SolutionType type={'UnrecognizedType' as SolutionTypeValue} />);

    expect(screen.getByTitle('')).toBeInTheDocument();
  });

  test('should show the title text alongside the icon when displayTitleText is true', () => {
    render(<SolutionType displayTitleText type="Workaround" />);

    expect(screen.getByText('Workaround')).toBeInTheDocument();
    expect(screen.getByTitle('Workaround')).toBeInTheDocument();
  });

  test('should not show title text by default', () => {
    render(<SolutionType type="Workaround" />);

    expect(screen.queryByText('Workaround')).not.toBeInTheDocument();
    expect(screen.getByTitle('Workaround')).toBeInTheDocument();
  });
});
