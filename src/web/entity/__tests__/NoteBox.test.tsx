/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {screen, rendererWith} from 'web/testing';
import Note from 'gmp/models/note';
import {createSession} from 'gmp/testing';
import NoteBox from 'web/entity/NoteBox';

const note = Note.fromElement({
  _id: '123',
  nvt: {
    _oid: '1.2.3',
    tags: 'bv=A:P|st=vf',
    refs: {ref: [{_type: 'cve', _id: 'CVE-2019-5678'}]},
  },
  text: 'foo',
  end_time: '2019-01-01T12:00:00Z',
  modification_time: '2019-02-02T12:00:00Z',
});

const createGmp = () => ({
  session: createSession({timezone: 'CET'}),
});

describe('NoteBox tests', () => {
  test('should render with DetailsLink', () => {
    const {render} = rendererWith({
      capabilities: true,
      router: true,
      gmp: createGmp(),
    });

    const {element} = render(<NoteBox detailsLink={true} note={note} />);

    const link = screen.getByTestId('details-link');
    const header = element.querySelector('h3');

    expect(link).toBeDefined();
    expect(header).toHaveTextContent('Note');
    expect(element).toHaveTextContent(
      'ModifiedSat, Feb 2, 2019 1:00 PM Central European Standard',
    );
    expect(element).toHaveTextContent(
      'Active untilTue, Jan 1, 2019 1:00 PM Central European Standard',
    );
    expect(element).toHaveTextContent('foo');
  });

  test('should render without DetailsLink', () => {
    const {render} = rendererWith({
      capabilities: true,
      router: true,
      gmp: createGmp(),
    });

    const {element} = render(<NoteBox detailsLink={false} note={note} />);

    const link = element.querySelector('a');

    expect(link).toEqual(null);
    expect(element).toHaveTextContent('foo');
    expect(element).not.toHaveTextContent('details.svg');
    expect(element).toHaveTextContent(
      'ModifiedSat, Feb 2, 2019 1:00 PM Central European Standard',
    );
    expect(element).toHaveTextContent(
      'Active untilTue, Jan 1, 2019 1:00 PM Central European Standard',
    );
  });
});
