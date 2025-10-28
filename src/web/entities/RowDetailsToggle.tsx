/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type HTMLAttributes, type MouseEvent} from 'react';
import styled from 'styled-components';
import useClickHandler from 'web/components/form/useClickHandler';
import Theme from 'web/utils/Theme';

interface RowDetailsToggleProps<TValue>
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'onClick'> {
  'data-testid'?: string;
  name?: string;
  value?: TValue;
  onClick?: (value: TValue, name?: string) => void;
}

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

const RowDetailsToggle = <TValue,>({
  'data-testid': dataTestId = 'row-details-toggle',
  name,
  value,
  onClick,
  ...props
}: RowDetailsToggleProps<TValue>) => {
  const handleClick = useClickHandler<
    Pick<RowDetailsToggleProps<TValue>, 'name' | 'value'>,
    TValue,
    MouseEvent<HTMLSpanElement>
  >({
    onClick,
    nameFunc: (event, props) => props.name,
    valueFunc: (event, props) => props.value as TValue,
    props: {name, value},
  });
  return (
    <StyledSpan {...props} data-testid={dataTestId} onClick={handleClick} />
  );
};

export default RowDetailsToggle;
