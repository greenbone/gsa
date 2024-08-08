/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useEffect, useState, useRef} from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isDefined, isFunction} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import Theme from 'web/utils/theme';

import useIconSize from 'web/hooks/useIconSize';

const Anchor = styled.a`
  display: flex;
`;

const Styled = styled.span`
  cursor: ${props => (props.onClick ? 'pointer' : undefined)};
  width: ${props => props.$width};
  height: ${props => props.$height};
  line-height: ${props => props.$lineHeight};
  @media print {
    & {
      ${props => (isDefined(props.onClick) ? {display: 'none'} : undefined)};
    }
  }

  & svg {
    background: ${props =>
      props.$isLoading
        ? 'url(/img/loading.gif) center center no-repeat'
        : undefined};
    height: ${props => props.height};
    width: ${props => props.width};
  }

  & svg path {
    display: ${props => (props.$isLoading ? 'none' : undefined)};
    fill: ${props =>
      props.$active || props.$isLoading ? undefined : Theme.inputBorderGray};
  }
  & * {
    height: inherit;
    width: inherit;
  }
`;

export const useIsMountedRef = () => {
  const ref = useRef();
  ref.current = true;
  // if the ref changes, which is the case when the component unmounts
  // set the ref.current to false in order to prevent state updates in
  // useStateWithMountCheck()
  useEffect(() => {
    return () => {
      ref.current = false;
    };
  }, [ref]);

  return ref;
};

// only update state if the component is mounted
// use useIsMountedRef() to track mounted status across renders
export const useStateWithMountCheck = (...args) => {
  const isMountedRef = useIsMountedRef();
  const [state, nativeSetState] = useState(...args);
  const setState = (...arg) => {
    if (isMountedRef.current) {
      nativeSetState(...arg);
    }
  };
  return [state, setState];
};

const SvgIcon = ({
  disabled = false,
  active = !disabled,
  children,
  loadingTitle = _('Loading...'),
  title,
  to,
  value,
  onClick,
  size,
  ...other
}) => {
  const [loading, setLoading] = useStateWithMountCheck(false);
  const {width, height} = useIconSize(size);

  const handleClick = event => {
    event.preventDefault();
    event.stopPropagation();
    const promise = onClick(value);

    if (isDefined(promise) && isDefined(promise.then)) {
      setLoading(true);
      // eslint-disable-next-line no-shadow
      promise
        .then(() => {
          setLoading(false);
        })
        .catch(error => {
          setLoading(false);
          throw error;
        });
    }
  };

  title = loading ? loadingTitle : title;

  if (isFunction(children)) {
    children = children({title});
  }

  return (
    <Styled
      {...other}
      data-testid="svg-icon"
      title={title}
      $active={active && !loading}
      $isLoading={loading}
      $height={height}
      $width={width}
      $lineHeight={height}
      onClick={
        isDefined(onClick) && !disabled && !loading ? handleClick : undefined
      }
    >
      {isDefined(to) ? <Anchor href={to}>{children}</Anchor> : children}
    </Styled>
  );
};

SvgIcon.propTypes = {
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  loadingTitle: PropTypes.string,
  title: PropTypes.string,
  to: PropTypes.string,
  value: PropTypes.any,
  onClick: PropTypes.func,
  size: PropTypes.oneOf(['tiny', 'small', 'medium', 'large']),
};

export default SvgIcon;
