/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';
import DialogCloseButton from 'web/components/dialog/DialogCloseButton';
import Layout from 'web/components/layout/Layout';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/Theme';

const StyledLayout = styled(Layout)`
  padding: 15px;
  margin: 0px 15px 20px 15px;
  border: 1px solid ${Theme.mediumLightRed};
  border-radius: 2px;
  color: ${Theme.darkRed};
  background-color: ${Theme.lightRed};
`;

const StyledDialogCloseButton = styled(DialogCloseButton)`
  background: 0;
  color: ${Theme.darkRed};

  :hover {
    border: 1px solid ${Theme.darkRed};
  }
`;

interface DialogErrorProps {
  error?: string;
  onCloseClick?: () => void;
}

const DialogError = ({error, onCloseClick}: DialogErrorProps) => {
  const [_] = useTranslation();
  if (!isDefined(error)) {
    return null;
  }
  return (
    <StyledLayout align={['space-between', 'center']}>
      <span
        style={{
          whiteSpace: 'pre-line',
        }}
      >
        {error}
      </span>
      <StyledDialogCloseButton
        data-testid="error-close-button"
        title={_('Close')}
        onClick={onCloseClick}
      />
    </StyledLayout>
  );
};

export default DialogError;
