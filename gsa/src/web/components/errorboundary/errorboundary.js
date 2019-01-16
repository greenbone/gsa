/* Copyright (C) 2018-2019 Greenbone Networks GmbH
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

import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import Icon from 'web/components/icon/icon';
import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';

import Theme from 'web/utils/theme';

const ErrorContainer = styled(Layout)`
  padding: 15px;
  margin: 15px 15px 15px 15px;
  border: 1px solid ${Theme.mediumLightRed};
  color: ${Theme.darkRed};
  background-color: ${Theme.lightRed};
`;

class ErrorBoundary extends React.Component {

  constructor(props) {
    super(props);

    this.state = {hasError: false};
  }

  componentDidCatch(error, info) {
    this.setState({
      hasError: true,
      error,
      info,
    });
  }

  render() {
    const {errElement = 'element'} = this.props;
    const message =
      _('An error occurred in this {{eElement}}.', {eElement: errElement});
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <Divider>
            <Icon
              img={'st_nonavailable.svg'}
              size="medium"
            />
            <b>{message}</b>
            <span>{_('Please try again.')}</span>
          </Divider>
        </ErrorContainer>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  errElement: PropTypes.string,
};

export default ErrorBoundary;

// vim: set ts=2 sw=2 tw=80:
