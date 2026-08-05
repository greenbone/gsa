/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import {debounce} from 'gmp/utils/event';
import {isDefined} from 'gmp/utils/identity';

type Size = {width: number; height: number};

interface AutoSizeProps {
  children: (size: Size) => ReactNode;
  measure?: (container: HTMLElement) => Size;
}

interface AutoSizeState {
  width?: number;
  height?: number;
}

const Container = styled.div`
  overflow: hidden;
`;

/**
 * Component to provide width and height props to a children function
 *
 * Initially it renders a <div/> container element. After mounting it calculates
 * the height and width of the container element and passes the width and height
 * to a child function. width and height are re-calculated on each render of
 * AutoSize.
 *
 * This component uses the render props pattern.
 */
const AutoSize = ({children, measure}: AutoSizeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef(measure);
  const [{width, height}, setSize] = useState<AutoSizeState>({});

  useEffect(() => {
    measureRef.current = measure;
  }, [measure]);

  const getSize = useCallback((): AutoSizeState => {
    const {current: container} = containerRef;

    if (container === null) {
      return {};
    }

    const currentMeasure = measureRef.current;
    const {width, height} = currentMeasure
      ? currentMeasure(container)
      : container.getBoundingClientRect();
    return {width, height};
  }, []);

  const updateSize = useCallback(() => {
    setSize(prevSize => {
      const nextSize = getSize();

      if (
        nextSize.width === prevSize.width &&
        nextSize.height === prevSize.height
      ) {
        return prevSize;
      }

      return nextSize;
    });
  }, [getSize]);

  const handleResize = useMemo(() => debounce(updateSize, 100), [updateSize]);

  useEffect(() => {
    window.addEventListener('resize', handleResize, {passive: true});
    updateSize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize, updateSize]);

  useEffect(() => {
    updateSize();
  });

  // only call children if height and width are defined
  const shouldCallChildren = isDefined(height) && isDefined(width);
  return (
    <Container ref={containerRef}>
      {shouldCallChildren && children({width, height})}
    </Container>
  );
};

export default AutoSize;
