/* Copyright (C) 2017-2019 Greenbone Networks GmbH
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

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import Divider from 'web/components/layout/divider';

import InfoPanel from 'web/components/panel/infopanel';

const Content = styled.span`
  ${props => {
    if (!isDefined(props.onClick)) {
      return undefined;
    }

    return {
      ':hover': {
        textDecoration: 'underline',
      },
      cursor: 'pointer',
    };
  }}
`;

const ReportPanel = ({children, icon, title, onClick}) => {
  return (
    <InfoPanel heading={title}>
      <Divider margin="1em" align={['start', 'center']}>
        {icon({size: 'large', onClick})}
        <Content onClick={onClick}>{children}</Content>
      </Divider>
    </InfoPanel>
  );
};

ReportPanel.propTypes = {
  icon: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

export default ReportPanel;

// vim: set ts=2 sw=2 tw=80:
