/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import {XIcon} from 'web/components/icon/icons';
import Layout from 'web/components/layout/Layout';
import PropTypes from 'web/utils/PropTypes';
import Theme from 'web/utils/Theme';
const Panel = styled(Layout)`
  background-color: ${Theme.white};
  border: 1px solid
    ${props => (props.$isWarning ? Theme.darkRed : Theme.lightBlue)};
  margin-top: ${props => (props.$noMargin ? '0px' : '5px')};
`;

const Heading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  min-height: 35px;
  background-color: ${props =>
    props.$isWarning ? Theme.mediumLightRed : Theme.lightBlue};
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
  noMargin,
  ...props
}) => {
  return (
    <Panel
      $isWarning={isWarning}
      $noMargin={noMargin}
      align={['start', 'stretch']}
      flex="column"
      {...props}
    >
      {heading && (
        <Heading $isWarning={isWarning} data-testid="infopanel-heading">
          {heading}
          {isDefined(onCloseClick) && (
            <XIcon
              color={Theme.darkGray}
              data-testid="panel-close-button"
              size="medium"
              variant="filled"
              onClick={onCloseClick}
            />
          )}
        </Heading>
      )}
      {children && <Body>{children}</Body>}
      {footer && <Footer>{footer}</Footer>}
    </Panel>
  );
};

InfoPanel.propTypes = {
  children: PropTypes.element,
  noMargin: PropTypes.bool,
  footer: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  heading: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  isWarning: PropTypes.bool,
  onCloseClick: PropTypes.func,
};

export default InfoPanel;
