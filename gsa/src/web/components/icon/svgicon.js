/* Copyright (C) 2018-2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React, {useState} from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isDefined, isFunction} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import Theme from 'web/utils/theme';

import withIconSize from 'web/components/icon/withIconSize';

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
  const [loading, setLoading] = useState(false);

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
