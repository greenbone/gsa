/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import BlankLink from 'web/components/link/BlankLink';
import useGmp from 'web/hooks/useGmp';

interface ProtocolDocLinkProps {
  title: string;
}

const ProtocolDocLink = ({title}: ProtocolDocLinkProps) => {
  const gmp = useGmp();
  const {protocolDocUrl} = gmp.settings;

  return (
    <BlankLink title={title} to={protocolDocUrl}>
      {title}
    </BlankLink>
  );
};

export default ProtocolDocLink;
