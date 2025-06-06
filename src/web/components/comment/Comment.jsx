/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import PropTypes from 'web/utils/PropTypes';

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
