/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import withLayout from 'web/components/layout/withLayout';
import {render} from 'web/utils/Testing';

const MyComp = props => <div {...props} />;

describe('withLayout HOC tests', () => {
  test('should create a new component', () => {
    const Comp = withLayout()(MyComp);
    const {element} = render(<Comp />);
    expect(element).toMatchSnapshot();
  });

  test('should create a new component with flex', () => {
    const Comp = withLayout({flex: true})(MyComp);
    const {element} = render(<Comp />);
    expect(element).toMatchSnapshot();
  });

  test('should create a new component with flex: row', () => {
    const Comp = withLayout({flex: 'row'})(MyComp);
    const {element} = render(<Comp />);
    expect(element).toMatchSnapshot();
  });

  test('should create a new component with flex: column', () => {
    const Comp = withLayout({flex: 'column'})(MyComp);
    const {element} = render(<Comp />);
    expect(element).toMatchSnapshot();
  });

  test('should create a new component with wrap', () => {
    const Comp = withLayout({wrap: true})(MyComp);
    const {element} = render(<Comp />);
    expect(element).toMatchSnapshot();
  });

  test('should create a new component with wrap: wrap', () => {
    const Comp = withLayout({wrap: 'wrap'})(MyComp);
    const {element} = render(<Comp />);
    expect(element).toMatchSnapshot();
  });

  test('should create a new component with wrap: nowrap', () => {
    const Comp = withLayout({wrap: 'nowrap'})(MyComp);
    const {element} = render(<Comp />);
    expect(element).toMatchSnapshot();
  });

  test('should create a new component with grow', () => {
    const Comp = withLayout({grow: true})(MyComp);
    const {element} = render(<Comp />);
    expect(element).toMatchSnapshot();
  });

  test('should create a new component with grow: 1', () => {
    const Comp = withLayout({grow: 1})(MyComp);
    const {element} = render(<Comp />);
    expect(element).toMatchSnapshot();
  });

  test('should create a new component with grow: 666', () => {
    const Comp = withLayout({grow: 666})(MyComp);
    const {element} = render(<Comp />);
    expect(element).toMatchSnapshot();
  });

  test('should create a new component with shrink', () => {
    const Comp = withLayout({shrink: true})(MyComp);
    const {element} = render(<Comp />);
    expect(element).toMatchSnapshot();
  });

  test('should create a new component with shrink: 1', () => {
    const Comp = withLayout({shrink: 1})(MyComp);
    const {element} = render(<Comp />);
    expect(element).toMatchSnapshot();
  });

  test('should create a new component with shrink: 666', () => {
    const Comp = withLayout({shrink: 666})(MyComp);
    const {element} = render(<Comp />);
    expect(element).toMatchSnapshot();
  });

  test('should create a new component with basis: auto', () => {
    const Comp = withLayout({basis: 'auto'})(MyComp);
    const {element} = render(<Comp />);
    expect(element).toMatchSnapshot();
  });

  test('should create a new component with basis: 20%', () => {
    const Comp = withLayout({basis: '20%'})(MyComp);
    const {element} = render(<Comp />);
    expect(element).toMatchSnapshot();
  });

  test('should create a new component with align: start', () => {
    const Comp = withLayout({align: 'start'})(MyComp);
    const {element} = render(<Comp />);
    expect(element).toMatchSnapshot();
  });

  test('should create a new component with flex: column, align: start', () => {
    const Comp = withLayout({flex: 'column', align: 'start'})(MyComp);
    const {element} = render(<Comp />);
    expect(element).toMatchSnapshot();
  });

  test('should create a new component with align: [start, end]', () => {
    const Comp = withLayout({align: ['start', 'end']})(MyComp);
    const {element} = render(<Comp />);
    expect(element).toMatchSnapshot();
  });

  test('should create a new component with flex: column, align: [start, end]', () => {
    const Comp = withLayout({flex: 'column', align: ['start', 'end']})(MyComp);
    const {element} = render(<Comp />);
    expect(element).toMatchSnapshot();
  });

  test('should create a new component with align: [center, stretch]', () => {
    const Comp = withLayout({align: ['center', 'stretch']})(MyComp);
    const {element} = render(<Comp />);
    expect(element).toMatchSnapshot();
  });
});
