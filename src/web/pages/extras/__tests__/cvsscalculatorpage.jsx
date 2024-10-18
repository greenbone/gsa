/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing, beforeEach} from '@gsa/testing';

import {rendererWith, wait} from 'web/utils/testing';

import CvssCalculator from 'web/pages/extras/cvsscalculatorpage';
import {
  changeInputValue,
  clickElement,
  queryAllSelectElements,
  getSelectItemElementsForSelect,
  getTextInputs,
} from 'web/components/testing';

const calculateScoreFromVector = testing.fn().mockReturnValue(
  Promise.resolve({
    data: 7.5,
  }),
);

const gmp = {
  cvsscalculator: {
    calculateScoreFromVector,
  },
  settings: {
    manualUrl: 'http://docs.greenbone.net/GSM-Manual/gos-5/',
  },
  user: {
    renewSession: testing.fn().mockReturnValue(
      Promise.resolve({
        data: 'foo',
      }),
    ),
  },
};

const location = {
  query: {cvssVector: 'AV:N/AC:L/Au:N/C:P/I:P/A:P'},
};

describe('CvssCalculator page tests', () => {
  beforeEach(() => {
    window.history.pushState({}, 'Test Title', '/');
  });
  test('Should render with default values', async () => {
    const {render} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    const {element} = render(<CvssCalculator />);

    await wait();

    const sections = element.querySelectorAll('section');
    const cvssV2section = sections[0].parentNode;
    const cvssV2selects = queryAllSelectElements(cvssV2section);
    const cvssV2vector = getTextInputs(cvssV2section)[0];

    /* CVSSv2 input */
    expect(cvssV2selects[0]).toHaveValue('Local');
    expect(cvssV2selects[1]).toHaveValue('Low');
    expect(cvssV2selects[2]).toHaveValue('None');
    expect(cvssV2selects[3]).toHaveValue('None');
    expect(cvssV2selects[4]).toHaveValue('None');
    expect(cvssV2selects[5]).toHaveValue('None');
    expect(cvssV2vector).toHaveValue('AV:L/AC:L/Au:N/C:N/I:N/A:N');

    /* CVSSv3 input */
    const cvssV3section = sections[1].parentNode;
    const cvssV3selects = queryAllSelectElements(cvssV3section);
    const cvssV3vector = getTextInputs(cvssV3section)[0];

    expect(cvssV3selects[0]).toHaveValue('Network');
    expect(cvssV3selects[1]).toHaveValue('Low');
    expect(cvssV3selects[2]).toHaveValue('None');
    expect(cvssV3selects[3]).toHaveValue('None');
    expect(cvssV3selects[4]).toHaveValue('Unchanged');
    expect(cvssV3selects[5]).toHaveValue('None');
    expect(cvssV3selects[6]).toHaveValue('None');
    expect(cvssV3selects[7]).toHaveValue('None');
    expect(cvssV3vector).toHaveValue(
      'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N',
    );
  });

  test('Should render userVector from url', async () => {
    window.history.pushState(
      {},
      'Test Title',
      `?cvssVector=AV:N/AC:L/Au:N/C:P/I:P/A:P`,
    );

    const {render} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    const {element} = render(<CvssCalculator />);

    await wait();

    const sections = element.querySelectorAll('section');
    const cvssV2section = sections[0].parentNode;
    const cvssV2selects = queryAllSelectElements(cvssV2section);
    const cvssV2vector = getTextInputs(cvssV2section)[0];

    /* CVSSv2 input */
    expect(cvssV2selects[0]).toHaveValue('Network');
    expect(cvssV2selects[1]).toHaveValue('Low');
    expect(cvssV2selects[2]).toHaveValue('None');
    expect(cvssV2selects[3]).toHaveValue('Partial');
    expect(cvssV2selects[4]).toHaveValue('Partial');
    expect(cvssV2selects[5]).toHaveValue('Partial');
    expect(cvssV2vector).toHaveValue('AV:N/AC:L/Au:N/C:P/I:P/A:P');

    /* CVSSv3 input */
    const cvssV3section = sections[1].parentNode;
    const cvssV3selects = queryAllSelectElements(cvssV3section);
    const cvssV3vector = getTextInputs(cvssV3section)[0];

    expect(cvssV3selects[0]).toHaveValue('Network');
    expect(cvssV3selects[1]).toHaveValue('Low');
    expect(cvssV3selects[2]).toHaveValue('None');
    expect(cvssV3selects[3]).toHaveValue('None');
    expect(cvssV3selects[4]).toHaveValue('Unchanged');
    expect(cvssV3selects[5]).toHaveValue('None');
    expect(cvssV3selects[6]).toHaveValue('None');
    expect(cvssV3selects[7]).toHaveValue('None');
    expect(cvssV3vector).toHaveValue(
      'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N',
    );
  });

  test('Changing userVector should change displayed select values', async () => {
    const {render} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    const {element} = render(<CvssCalculator location={location} />);

    await wait();

    const sections = element.querySelectorAll('section');
    const cvssV2section = sections[0].parentNode;
    const cvssV2selects = queryAllSelectElements(cvssV2section);
    const cvssV2vector = getTextInputs(cvssV2section)[0];

    const cvssV3section = sections[1].parentNode;
    const cvssV3selects = queryAllSelectElements(cvssV3section);
    const cvssV3vector = getTextInputs(cvssV3section)[0];

    changeInputValue(cvssV2vector, 'AV:N/AC:L/Au:N/C:N/I:P/A:P');
    changeInputValue(
      cvssV3vector,
      'CVSS:3.1/AV:P/AC:H/PR:L/UI:R/S:C/C:H/I:H/A:H',
    );

    await wait();

    /* CVSSv2 input */
    expect(cvssV2selects[0]).toHaveValue('Network');
    expect(cvssV2selects[1]).toHaveValue('Low');
    expect(cvssV2selects[2]).toHaveValue('None');
    expect(cvssV2selects[3]).toHaveValue('None');
    expect(cvssV2selects[4]).toHaveValue('Partial');
    expect(cvssV2selects[5]).toHaveValue('Partial');
    expect(cvssV2vector).toHaveValue('AV:N/AC:L/Au:N/C:N/I:P/A:P');

    /* CVSSv3 input */
    expect(cvssV3selects[0]).toHaveValue('Physical');
    expect(cvssV3selects[1]).toHaveValue('High');
    expect(cvssV3selects[2]).toHaveValue('Low');
    expect(cvssV3selects[3]).toHaveValue('Required');
    expect(cvssV3selects[4]).toHaveValue('Changed');
    expect(cvssV3selects[5]).toHaveValue('High');
    expect(cvssV3selects[6]).toHaveValue('High');
    expect(cvssV3selects[7]).toHaveValue('High');
    expect(cvssV3vector).toHaveValue(
      'CVSS:3.1/AV:P/AC:H/PR:L/UI:R/S:C/C:H/I:H/A:H',
    );
  });

  test('Changing displayed select values should change userVector', async () => {
    window.history.pushState(
      {},
      'Test Title',
      `?cvssVector=AV:N/AC:L/Au:N/C:P/I:P/A:P`,
    );

    const {render} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    const {element} = render(<CvssCalculator />);

    await wait();

    const sections = element.querySelectorAll('section');
    const cvssV2section = sections[0].parentNode;
    const cvssV2selects = queryAllSelectElements(cvssV2section);
    const cvssV2vector = getTextInputs(cvssV2section)[0];

    const cvssV3section = sections[1].parentNode;
    const cvssV3selects = queryAllSelectElements(cvssV3section);
    const cvssV3vector = getTextInputs(cvssV3section)[0];

    /* CVSSv2 input */
    expect(cvssV2selects[0]).toHaveValue('Network');
    expect(cvssV2selects[1]).toHaveValue('Low');
    expect(cvssV2selects[2]).toHaveValue('None');
    expect(cvssV2selects[3]).toHaveValue('Partial');
    expect(cvssV2selects[4]).toHaveValue('Partial');
    expect(cvssV2selects[5]).toHaveValue('Partial');
    expect(cvssV2vector).toHaveValue('AV:N/AC:L/Au:N/C:P/I:P/A:P');

    /* CVSSv3 input */
    expect(cvssV3selects[0]).toHaveValue('Network');
    expect(cvssV3selects[1]).toHaveValue('Low');
    expect(cvssV3selects[2]).toHaveValue('None');
    expect(cvssV3selects[3]).toHaveValue('None');
    expect(cvssV3selects[4]).toHaveValue('Unchanged');
    expect(cvssV3selects[5]).toHaveValue('None');
    expect(cvssV3selects[6]).toHaveValue('None');
    expect(cvssV3selects[7]).toHaveValue('None');
    expect(cvssV3vector).toHaveValue(
      'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N',
    );

    const cvssV2items = await getSelectItemElementsForSelect(cvssV2selects[0]);
    await clickElement(cvssV2items[0]);

    const cvssV3items = await getSelectItemElementsForSelect(cvssV3selects[1]);
    await clickElement(cvssV3items[1]);

    expect(cvssV2vector).toHaveValue('AV:L/AC:L/Au:N/C:P/I:P/A:P');
    expect(cvssV3vector).toHaveValue(
      'CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:N',
    );
  });
});
