/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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
import React, {useEffect, useState, useRef} from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isDefined, isFunction} from 'gmp/utils/identity';

import withIconSize from 'web/components/icon/withIconSize';

import PropTypes from 'web/utils/proptypes';

import Theme from 'web/utils/theme';

const Anchor = styled.a`
  display: flex;
`;

const Styled = styled.span`
  cursor: ${props => (isDefined(props.onClick) ? 'pointer' : undefined)};

  @media print {
    & {
      ${props => (isDefined(props.onClick) ? {display: 'none'} : undefined)};
    }
  }

  & svg {
    background: ${props =>
      props.isLoading
        ? 'url(/img/loading.gif) center center no-repeat'
        : undefined};
  }

  & svg path {
    display: ${props => (props.isLoading ? 'none' : undefined)};
    fill: ${props =>
      props.active || props.isLoading ? undefined : Theme.inputBorderGray};
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
  ...other
}) => {
  const [loading, setLoading] = useStateWithMountCheck(false);

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
      active={active && !loading}
      isLoading={loading}
      title={title}
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
};

export default withIconSize()(SvgIcon);

// vim: set ts=2 sw=2 tw=80:
