/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import FormGroup from 'web/components/form/FormGroup';

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

  test("should render with htmlFor and label's htmlFor should match", () => {
    render(
      <FormGroup htmlFor="input-id" title="Some Label">
        <input id="input-id" name="input-name" />
      </FormGroup>,
    );

    const input = screen.getByLabelText('Some Label');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'input-id');
    expect(input).toHaveAttribute('name', 'input-name');
  });
});
