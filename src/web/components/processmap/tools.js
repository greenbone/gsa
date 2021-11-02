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

import React from 'react';
import styled, {keyframes} from 'styled-components';

import _ from 'gmp/locale';

import ConditionalColorizationIcon from 'web/components/icon/condcoloricon';
import DeleteIcon from 'web/components/icon/deleteicon';
import EdgeIcon from 'web/components/icon/edgeicon';
import MagnifierIcon from 'web/components/icon/magnifiericon';
import MinusIcon from 'web/components/icon/minusicon';
import NewProcessIcon from 'web/components/icon/newprocessicon';
import PlusIcon from 'web/components/icon/plusicon';

import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import {MAX_PROCESSES} from './processmap';

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 50px;
  height: 100%;
  background-color: ${Theme.lightGray};
  opacity: 0.7;
  border-right: 2px solid ${Theme.lightGray};
`;

const IconWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: space-around;
  padding: 10px 0 10px 0;
  & svg path {
    fill: ${props => (props.isInactive ? Theme.inputBorderGray : Theme.black)};
  }
  &:hover {
    cursor: ${props => (props.isInactive ? 'default' : 'pointer')};
    background-color: ${props =>
      props.isInactive ? undefined : Theme.dialogGray};
  }
  ${props =>
    props.isActive
      ? {
          backgroundColor: Theme.green,
        }
      : undefined}
`;

const HelperArrow = styled.div`
  position: absolute;
  top: 13px;
  left: 50px;
  width: 5px;
  height: 5px;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-right: 10px solid ${Theme.green};

  animation: ${keyframes({
      '0%': {
        opacity: 0,
      },
      '83%': {
        opacity: 0,
      },
      '100%': {
        opacity: 1,
      },
    })}
    3s ease;
`;

const Helper = styled.div`
  position: absolute;
  top: 5px;
  left: 60px;
  background-color: ${Theme.offWhite};
  border: 1px solid ${Theme.green};
  border-radius: 2px;
  padding: 10px;
  width: 200px;
  box-shadow: 5px 5px 5px ${Theme.mediumGray};

  animation: ${keyframes({
      '0%': {
        opacity: 0,
      },
      '66%': {
        opacity: 0,
        transform: 'scale(0.5)',
      },
      '83%': {
        opacity: 0.5,
        transform: 'scale(1.2)',
        scale: 1,
      },
      '100%': {
        opacity: 1,
        transform: 'scale(1)',
      },
    })}
    3s ease;
`;

const Tools = ({
  applyConditionalColorization,
  drawIsActive,
  maxNumProcessesReached,
  maxZoomReached,
  minZoomReached,
  showNoEdgeHelper = false,
  showNoProcessHelper = false,
  onCreateProcessClick,
  onDrawEdgeClick,
  onDeleteClick,
  onToggleConditionalColorization,
  onZoomChangeClick,
}) => {
  const applyConditionalColorizationIconTitle = applyConditionalColorization
    ? _('Turn off conditional colorization')
    : _('Turn on conditional colorization');
  return (
    <Container>
      <span>
        <IconWrapper
          isInactive={maxNumProcessesReached}
          data-testid="bpm-tool-icon-new"
          title={
            maxNumProcessesReached
              ? _('Maximum number of {{num}} processes reached', {
                  num: MAX_PROCESSES.toString(),
                })
              : _('Create new process')
          }
          onClick={
            maxNumProcessesReached ? undefined : () => onCreateProcessClick()
          }
        >
          <NewProcessIcon size="medium" />
          {showNoProcessHelper && (
            <React.Fragment>
              <Helper>{_('Click here to create a process.')}</Helper>
              <HelperArrow />
            </React.Fragment>
          )}
        </IconWrapper>
        <IconWrapper
          data-testid="bpm-tool-icon-edge"
          title={_('Create new connection')}
          isActive={drawIsActive}
          onClick={onDrawEdgeClick}
        >
          <EdgeIcon size="medium" />
          {showNoEdgeHelper && (
            <React.Fragment>
              <Helper>
                {_(
                  'To connect processes, click here, select the source process first and then the target.',
                )}
              </Helper>
              <HelperArrow />
            </React.Fragment>
          )}
        </IconWrapper>
        <IconWrapper
          data-testid="bpm-tool-icon-delete"
          title={_('Delete selected element')}
          onClick={onDeleteClick}
        >
          <DeleteIcon size="medium" />
        </IconWrapper>
        <hr />
        <IconWrapper
          data-testid="bpm-tool-icon-color"
          isActive={applyConditionalColorization}
          title={applyConditionalColorizationIconTitle}
          onClick={onToggleConditionalColorization}
        >
          <ConditionalColorizationIcon size="medium" />
        </IconWrapper>
      </span>
      <span>
        <hr />
        <Layout flex="column">
          <IconWrapper
            isInactive={maxZoomReached}
            data-testid="bpm-tool-icon-zoomin"
            title={_('Zoom in')}
            onClick={maxZoomReached ? undefined : () => onZoomChangeClick('+')}
          >
            <PlusIcon size="medium" />
          </IconWrapper>
          <IconWrapper
            data-testid="bpm-tool-icon-zoomreset"
            title={_('Reset zoom')}
            onClick={() => onZoomChangeClick('0')}
          >
            <MagnifierIcon size="medium" />
          </IconWrapper>
          <IconWrapper
            isInactive={minZoomReached}
            data-testid="bpm-tool-icon-zoomout"
            title={_('Zoom out')}
            onClick={minZoomReached ? undefined : () => onZoomChangeClick('-')}
          >
            <MinusIcon size="medium" />
          </IconWrapper>
        </Layout>
      </span>
    </Container>
  );
};

Tools.propTypes = {
  applyConditionalColorization: PropTypes.bool,
  drawIsActive: PropTypes.bool,
  maxNumProcessesReached: PropTypes.bool,
  maxZoomReached: PropTypes.bool.isRequired,
  minZoomReached: PropTypes.bool.isRequired,
  showNoEdgeHelper: PropTypes.bool,
  showNoProcessHelper: PropTypes.bool,
  onCreateProcessClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
  onDrawEdgeClick: PropTypes.func,
  onToggleConditionalColorization: PropTypes.func,
  onZoomChangeClick: PropTypes.func,
};

export default Tools;

// vim: set ts=2 sw=2 tw=80:
