/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import FormGroup from 'web/components/form/FormGroup';
import {render, screen} from 'web/utils/Testing';


describe('FormGroup tests', () => {
  test('should render', () => {
    const {element} = render(<FormGroup />);

    expect(element).toBeInTheDocument();
  });

  test('should render with title', () => {
    const {element} = render(<FormGroup title="Foo" />);

    expect(element).toHaveTextContent('Foo');
  });

  test('should render with children', () => {
    render(
      <FormGroup>
        <div data-testid="inner">Foo</div>
      </FormGroup>,
    );

    const content = screen.getByTestId('inner');
    expect(content).toHaveTextContent('Foo');
  });
});
