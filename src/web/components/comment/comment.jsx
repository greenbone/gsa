/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import PropTypes from 'web/utils/proptypes';

const Comment = ({text, children}) => {
  if (!isDefined(text)) {
    text = children;
  }

  if (!isDefined(text)) {
    return null;
  }
  return (
    <div className="comment" data-testid="comment">
      {text}
    </div>
  );
};

Comment.propTypes = {
  text: PropTypes.string,
};

export default Comment;
