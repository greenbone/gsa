/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type EntityType} from 'gmp/utils/entity-type';
import Link, {type LinkProps} from 'web/components/link/Link';
import useCapabilities from 'web/hooks/useCapabilities';
import {entityURL} from 'web/route-paths';

export interface DetailsLinkProps extends LinkProps {
  id: string;
  type: EntityType;
  textOnly?: boolean;
  linkTitle?: string;
  underline?: boolean;
}

const DetailsLink = ({
  id,
  type,
  textOnly = false,
  linkTitle,
  title,
  style,
  underline = false,
  ...props
}: DetailsLinkProps) => {
  const capabilities = useCapabilities();
  textOnly = textOnly || !capabilities?.mayAccess(type) || !id;
  return (
    <Link
      {...props}
      data-testid="details-link"
      style={
        underline && !textOnly ? {...style, textDecoration: 'underline'} : style
      }
      textOnly={textOnly}
      title={!textOnly ? (linkTitle ?? title) : title}
      to={entityURL(type, id)}
    />
  );
};

export default DetailsLink;
