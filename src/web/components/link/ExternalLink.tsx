/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import ConfirmationDialog from 'web/components/dialog/ConfirmationDialog';
import {withTextOnly} from 'web/components/link/Link';
import useTranslation from 'web/hooks/useTranslation';

interface ExternalLinkProps
  extends Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    'href' | 'onClick'
  > {
  to: string;
  children?: React.ReactNode;
}

const ExternalLink = ({children, to, ...props}: ExternalLinkProps) => {
  const [_] = useTranslation();
  const [dialogVisible, setDialogVisible] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
    setDialogVisible(true);
  };

  const handleCloseDialog = () => {
    setDialogVisible(false);
  };

  const handleOpenLink = () => {
    window.open(to, '_blank', 'noopener, scrollbars=1, resizable=1');
    handleCloseDialog();
  };

  const dialogTitle = _('You are leaving OPENVAS');
  const dialogText = _(
    'This dialog will open a new window for {{- to}} ' +
      'if you click on "follow link". Following this link is on your own ' +
      'responsibility. Greenbone does not endorse the content you will ' +
      'see there.',
    {to},
  );

  return (
    <>
      <a {...props} href={to} onClick={handleClick}>
        {children}
      </a>
      {dialogVisible && (
        <ConfirmationDialog
          content={dialogText}
          rightButtonTitle={_('Follow Link')}
          title={dialogTitle}
          width="500px"
          onClose={handleCloseDialog}
          onResumeClick={handleOpenLink}
        />
      )}
    </>
  );
};

export default withTextOnly(ExternalLink);
