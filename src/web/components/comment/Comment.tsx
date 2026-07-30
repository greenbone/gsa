/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';

interface CommentProps {
  text?: string;
  children?: React.ReactNode;
}

const Comment = ({text, children}: CommentProps) => {
  return (
    <div className="comment" data-testid="comment">
      {isDefined(text) ? text : children}
    </div>
  );
};

export default Comment;
