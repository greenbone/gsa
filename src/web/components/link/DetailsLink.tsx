/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import Link, {LinkProps} from 'web/components/link/Link';
import useCapabilities from 'web/hooks/useCapabilities';

interface DetailsLinkProps extends LinkProps {
  id: string;
  type: string;
  textOnly?: boolean;
}

const DetailsLink = ({
  id,
  type,
  textOnly = false,
  ...props
}: DetailsLinkProps) => {
  const capabilities = useCapabilities();

  textOnly = textOnly || !capabilities?.mayAccess(type) || !isDefined(id);

  return (
    <Link
      {...props}
      data-testid="details-link"
      textOnly={textOnly}
      to={`/${type}/${encodeURIComponent(id)}`}
    />
  );
};

export default DetailsLink;
