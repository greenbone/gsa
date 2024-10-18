/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useEffect} from 'react';

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent, act} from 'web/utils/testing';

import CloneIcon from '../cloneicon';

import {useStateWithMountCheck, useIsMountedRef} from '../svgicon';

const entity = {name: 'entity'};

describe('SVG icon component tests', () => {
  test('should render icon', () => {
    const handleClick = testing.fn();

    const {container} = render(
      <CloneIcon
        title="Clone Entity"
        value={entity}
        active={true}
        onClick={handleClick}
      />,
    );
    expect(container).toBeVisible();
  });

  test('should render loading state', async () => {
    let res;
    const promise = new Promise((resolve, reject) => {
      res = resolve;
    });

    const handleClick = testing.fn().mockReturnValue(promise);

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
    const callback = testing.fn();

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
    const callback = testing.fn();

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
