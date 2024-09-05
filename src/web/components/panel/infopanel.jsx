/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import styled from 'styled-components';

import {isDefined} from 'gmp/utils/identity';

import DeleteIcon from 'web/components/icon/deleteicon';

import {styledExcludeProps} from 'web/utils/styledConfig';
import PropTypes from 'web/utils/proptypes';

import Theme from 'web/utils/theme';

import Layout from 'web/components/layout/layout';

import Button from './button';

const Panel = styledExcludeProps(styled(Layout), ['isWarning', 'noMargin'])`
  background-color: ${Theme.white};
  border: 1px solid
    ${props => (props.isWarning ? Theme.darkRed : Theme.lightBlue)};
  margin-top: ${props => (props.noMargin ? '0px' : '5px')};
`;

const Heading = styledExcludeProps(styled.div, ['isWarning'])`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  min-height: 35px;
  background-color: ${props =>
    props.isWarning ? Theme.mediumLightRed : Theme.lightBlue};
  border-color: ${Theme.mediumBlue};
`;

const Footer = styled.div`
  display: flex;
  padding: 10px 15px;
  border-bottom: 1px solid ${Theme.lightBlue};
  min-height: 35px;
  background-color: ${Theme.lightBlue};
`;

const Body = styled.div`
  display: flex;
  padding: 15px;
  flex-grow: 1;
`;

const InfoPanel = ({
  heading,
  footer,
  isWarning = false,
  children,
  onCloseClick,
  ...props
}) => {
  return (
    <Panel
      isWarning={isWarning}
      {...props}
      align={['start', 'stretch']}
      flex="column"
    >
      {heading && (
        <Heading data-testid="infopanel-heading" isWarning={isWarning}>
          {heading}
          {isDefined(onCloseClick) && (
            <Button data-testid="panel-close-button" onClick={onCloseClick}>
              <DeleteIcon />
            </Button>
          )}
        </Heading>
      )}
      {children && <Body>{children}</Body>}
      {footer && <Footer>{footer}</Footer>}
    </Panel>
  );
};

InfoPanel.propTypes = {
  footer: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  heading: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  isWarning: PropTypes.bool,
  onCloseClick: PropTypes.func,
};

export default InfoPanel;

// vim: set ts=2 sw=2 tw=80:
