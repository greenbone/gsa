/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
import React, {useEffect} from 'react';
import {act} from 'react-dom/test-utils';

import {render, fireEvent} from 'web/utils/testing';

import CloneIcon from '../cloneicon';

import {useStateWithMountCheck, useIsMountedRef} from '../svgicon';

const entity = {name: 'entity'};

describe('SVG icon component tests', () => {
  test('should render icon', () => {
    const handleClick = jest.fn();

    const {element} = render(
      <CloneIcon
        title="Clone Entity"
        value={entity}
        active={true}
        onClick={handleClick}
      />,
    );

    expect(element).toMatchSnapshot();
  });

  test('should render loading state', async () => {
    let res;
    const promise = new Promise((resolve, reject) => {
      res = resolve;
    });

    const handleClick = jest.fn().mockReturnValue(promise);

    const {element} = render(
      <CloneIcon
        title="Clone Entity"
        value={entity}
        active={true}
        onClick={handleClick}
      />,
    );

    expect(element).toHaveAttribute('title', 'Clone Entity');
    fireEvent.click(element);
    expect(handleClick).toHaveBeenCalledWith(entity);
    expect(element).toHaveAttribute('title', 'Loading...');

    await act(async () => {
      res();
    });

    expect(element).toHaveAttribute('title', 'Clone Entity');
  });
});

describe('useStateWithMountCheck() hook tests', () => {
  test('should not update state when component is unmounted', () => {
    const MockComponent = () => {
      const [state, setState] = useStateWithMountCheck(true);
      const handleClick = () => {
        setState(!state);
      };
      return <div onClick={handleClick}>{state.toString()}</div>;
    };

    const {element, unmount} = render(<MockComponent />);

    expect(element).toHaveTextContent('true');
    fireEvent.click(element);
    expect(element).toHaveTextContent('false');
    unmount();
    fireEvent.click(element);
    expect(element).toHaveTextContent('false');
  });
});
describe('useIsMountedRef() hook tests', () => {
  test('should return false after component is unmounted', () => {
    const callback = jest.fn();

    const MockComponent = () => {
      const isMountedRef = useIsMountedRef();
      useEffect(() => {
        // we are not referencing a DOM node, therefore we can ignore eslint
        /* eslint-disable react-hooks/exhaustive-deps */
        return () => callback(isMountedRef.current);
        /* eslint-enable */
      }, [isMountedRef]);
      return null;
    };

    const {unmount} = render(<MockComponent />);
    unmount();
    expect(callback).toHaveBeenCalledWith(false);
  });

  test('should return true if component is mounted', () => {
    const callback = jest.fn();

    const MockComponent = () => {
      const isMountedRef = useIsMountedRef();
      useEffect(() => {
        callback(isMountedRef.current);
      }, [isMountedRef]);
      return null;
    };

    render(<MockComponent />);
    expect(callback).toHaveBeenCalledWith(true);
  });
});
