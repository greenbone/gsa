/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Delta} from 'gmp/models/result';
import {DiffIcon, EqualIcon, MinusIcon, PlusIcon} from 'web/components/icon';
import useTranslation from 'web/hooks/useTranslation';

interface ResultDeltaProps {
  delta?: Delta;
}

const ResultDelta = ({delta}: ResultDeltaProps) => {
  const [_] = useTranslation();
  switch (delta?.delta_type) {
    case Delta.TYPE_NEW:
      return <PlusIcon title={_('New')} />;
    case Delta.TYPE_CHANGED:
      return <DiffIcon title={_('Changed')} />;
    case Delta.TYPE_GONE:
      return <MinusIcon title={_('Gone')} />;
    case Delta.TYPE_SAME:
      return <EqualIcon title={_('Same')} />;
    default:
      return null;
  }
};

export default ResultDelta;
