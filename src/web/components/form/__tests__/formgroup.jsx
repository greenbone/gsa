/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {render} from 'web/utils/testing';

import FormGroup from '../formgroup';

describe('FormGroup tests', () => {
  test('should render', () => {
    const {element, getByTestId} = render(<FormGroup />);

    expect(element).toHaveStyleRule('display', 'flex');
    expect(element).toHaveStyleRule('padding-bottom', '10px');

    const content = getByTestId('formgroup-content');
    expect(content).toHaveStyleRule('display', 'flex');
    expect(content).toHaveStyleRule('flex-direction', 'row');

    expect(element).toMatchSnapshot();
  });

  test('should render with title', () => {
    const {element, getByTestId} = render(<FormGroup title="Foo" />);

    const titleElement = getByTestId('formgroup-title');
    expect(titleElement).toHaveTextContent('Foo');

    expect(element).toMatchSnapshot();
  });

  test('should render with children', () => {
    const {getByTestId} = render(
      <FormGroup>
        <div>Foo</div>
      </FormGroup>,
    );

    const content = getByTestId('formgroup-content');
    expect(content).toHaveTextContent('Foo');
  });

  test('should allow to set size', () => {
    const {getByTestId} = render(<FormGroup title="Foo" size="6" />);

    const content = getByTestId('formgroup-content');
    expect(content).toHaveStyleRule('width', '50%');
  });

  test('should allow to set offset', () => {
    const {getByTestId} = render(<FormGroup title="Foo" offset="3" />);

    const content = getByTestId('formgroup-content');
    expect(content).toHaveStyleRule('margin-left', '25%');
  });

  test('should allow to set title offset', () => {
    const {getByTestId} = render(<FormGroup title="Foo" titleOffset="2" />);

    const content = getByTestId('formgroup-content');
    expect(content).toHaveStyleRule('width', '66.66666667%');

    const titleElement = getByTestId('formgroup-title');
    expect(titleElement).toHaveStyleRule('width', '16.66666667%');
    expect(titleElement).toHaveStyleRule('margin-left', '16.66666667%');
  });

  test('should allow to set title size', () => {
    const {getByTestId} = render(<FormGroup title="Foo" titleSize="4" />);

    const content = getByTestId('formgroup-content');
    expect(content).toHaveStyleRule('width', '66.66666667%');

    const titleElement = getByTestId('formgroup-title');
    expect(titleElement).toHaveStyleRule('width', '33.33333333%');
    expect(titleElement).toHaveStyleRule('margin-left', '0');
  });
});

// vim: set ts=2 sw=2 tw=80:
