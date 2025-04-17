/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import PropTypes from 'prop-types';
import styled from 'styled-components';
import useClickHandler from 'web/components/form/useClickHandler';
import Theme from 'web/utils/Theme';

const StyledSpan = styled.span`
  cursor: pointer;
  text-decoration: none;
  color: ${Theme.blue};
  :hover {
    text-decoration: underline;
    color: ${Theme.blue};
  }
  @media print {
    color: ${Theme.black};
  }
`;

const RowDetailsToggle = ({name, onClick, ...props}) => {
  const handleClick = useClickHandler({
    onClick,
    name,
    nameFunc: (event, props) => props.name,
  });
  return (
    <StyledSpan
      data-testid="row-details-toggle"
      {...props}
      name={name}
      onClick={handleClick}
    />
  );
};

RowDetailsToggle.propTypes = {name: PropTypes.string, onClick: PropTypes.func};

export default RowDetailsToggle;
