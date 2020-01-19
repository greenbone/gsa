/* Copyright (C) 2019 Greenbone Networks GmbH
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

import BpmIcon from 'web/components/icon/bpmicon';
import DeleteIcon from 'web/components/icon/deleteicon';
import TrendNoChangeIcon from 'web/components/icon/trendnochangeicon';
import HelpIcon from 'web/components/icon/helpicon';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 50px;
  height: 100%;
  background-color: ${Theme.lightGray};
  opacity: 0.7;
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 10px 0 10px 0;
  & svg path {
    fill: ${Theme.darkGray};
  }
  &:hover {
    cursor: pointer;
    background-color: ${Theme.mediumGray};
    & svg path {
      fill: white;
    }
  }
  ${props =>
    props.drawIsActive
      ? {
          backgroundColor: Theme.green,
        }
      : undefined}
`;

const Tools = ({
  drawIsActive,
  onCreateProcessClick,
  onDrawEdgeClick,
  onDeleteClick,
}) => (
  <Container>
    <IconWrapper title={_('Create new process')} onClick={onCreateProcessClick}>
      <BpmIcon size="medium" />
    </IconWrapper>
    <IconWrapper
      title={_('Create new connection')}
      drawIsActive={drawIsActive}
      onClick={onDrawEdgeClick}
    >
      <TrendNoChangeIcon size="medium" />
    </IconWrapper>
    <IconWrapper title={_('Delete selected element')} onClick={onDeleteClick}>
      <DeleteIcon size="medium" />
    </IconWrapper>
    <IconWrapper>
      <HelpIcon title={_('Quick Help')} size="medium" />
    </IconWrapper>
  </Container>
);

Tools.propTypes = {
  drawIsActive: PropTypes.bool,
  onCreateProcessClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
  onDrawEdgeClick: PropTypes.func,
};

export default Tools;

// vim: set ts=2 sw=2 tw=80:
