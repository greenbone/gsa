/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {EntityType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import Link, {LinkProps} from 'web/components/link/Link';
import useCapabilities from 'web/hooks/useCapabilities';

export interface DetailsLinkProps extends LinkProps {
  id: string;
  type: EntityType;
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
