/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

interface InnerLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  children?: React.ReactNode;
}

const InnerLink = ({children, to, ...props}: InnerLinkProps) => {
  return (
    <a {...props} href={'#' + to}>
      {children}
    </a>
  );
};

export default InnerLink;
