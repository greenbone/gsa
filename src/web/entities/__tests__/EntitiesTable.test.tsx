/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor, within} from 'web/testing';
import Model from 'gmp/models/model';
import TableData from 'web/components/table/TableData';
import EntitiesTable, {
  type RowComponentProps,
  type PaginationComponentProps,
} from 'web/entities/EntitiesTable';
import TableEntityName from 'web/entities/TableEntityName';
import withRowDetails from 'web/entities/withRowDetails';

const entities = [
  new Model({id: '1', name: 'First'}),
  new Model({id: '2', name: 'Second'}),
];

const Row = ({entity, links, preview}: RowComponentProps<Model>) => (
  <tr>
    <td>
      <TableEntityName
        id={entity.id}
        links={links}
        preview={preview}
        type="target"
      >
        {entity.name}
      </TableEntityName>
    </td>
  </tr>
);

const Details = withRowDetails<Model>(
  'target',
  1,
)(({entity}) => <span>Details for {entity.name}</span>);
const Pagination = ({onNextClick}: PaginationComponentProps) => (
  <button onClick={onNextClick}>Next page</button>
);

const withMotion = async (run: () => Promise<void>) => {
  const matchMedia = testing.mocked(window.matchMedia);
  const original = matchMedia.getMockImplementation();
  if (!original) {
    throw new Error('Expected the test matchMedia implementation');
  }
  await matchMedia.withImplementation(
    query => Object.defineProperty(original(query), 'matches', {value: false}),
    run,
  );
};

describe('EntitiesTable disclosure', () => {
  test('preserves the horizontal divider and nested table spacing', async () => {
    const NestedDetails = withRowDetails<Model>(
      'target',
      1,
    )(() => (
      <table>
        <tbody>
          <tr>
            <TableData data-testid="nested-detail-cell">
              <TableEntityName>Nested value</TableEntityName>
            </TableData>
          </tr>
        </tbody>
      </table>
    ));
    const {render} = rendererWith({capabilities: true, router: true});
    const {userEvent} = render(
      <EntitiesTable
        entities={entities}
        links={false}
        pagination={false}
        row={Row}
        rowDetails={NestedDetails}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', {name: /preview for First/}),
    );
    const nestedCell = await screen.findByTestId('nested-detail-cell');
    expect(
      screen.queryByRole('button', {name: /preview for Nested value/}),
    ).not.toBeInTheDocument();
    const content = nestedCell.closest('table')?.parentElement?.parentElement;
    expect(content).toHaveStyle({
      flexDirection: 'row',
      alignItems: 'stretch',
      paddingTop: '8px',
      paddingBottom: '8px',
    });
    expect(nestedCell.firstElementChild).toHaveStyle({
      paddingTop: '8px',
      paddingBottom: '8px',
    });
    expect(content?.firstElementChild).toHaveStyle({
      borderRightWidth: '2px',
      borderRightStyle: 'solid',
      flexShrink: '0',
    });
  });

  test.each([false, true])(
    'synchronizes individual and all-row expansion (doubleRow=%s)',
    async doubleRow => {
      const {render} = rendererWith({capabilities: true, router: true});
      const {userEvent} = render(
        <EntitiesTable
          doubleRow={doubleRow}
          entities={entities}
          footnote={false}
          links={false}
          pagination={false}
          row={Row}
          rowDetails={Details}
        />,
      );
      const first = screen.getByRole('button', {name: /preview for First/});
      const second = screen.getByRole('button', {name: /preview for Second/});

      expect(first).toHaveAttribute('aria-expanded', 'false');
      await userEvent.click(first);
      expect(first).toHaveAttribute('aria-expanded', 'true');
      const detailsId = first.getAttribute('aria-controls') ?? '';
      await waitFor(() => {
        expect(document.getElementById(detailsId)).toHaveTextContent(
          'Details for First',
        );
      });
      expect(document.getElementById(detailsId)?.tagName).toBe('TR');
      expect(second).toHaveAttribute('aria-expanded', 'false');

      await userEvent.click(second);
      await userEvent.click(screen.getByTestId('fold-state-icon-fold'));
      await waitFor(() => {
        expect(screen.queryByText('Details for First')).not.toBeInTheDocument();
        expect(first).not.toHaveAttribute('aria-controls');
      });
      expect(second).toHaveAttribute('aria-expanded', 'false');

      await userEvent.click(screen.getByTestId('fold-state-icon-unfold'));
      await userEvent.click(first);
      expect(screen.getByTestId('fold-state-icon-unfold')).toBeInTheDocument();
      await userEvent.click(screen.getByTestId('fold-state-icon-unfold'));
      expect(first).toHaveAttribute('aria-expanded', 'true');
      expect(second).toHaveAttribute('aria-expanded', 'true');
      expect(first).toHaveAttribute('aria-controls', detailsId);
    },
  );

  test('uses unique targets when the same entity appears in multiple tables', async () => {
    const {render} = rendererWith({capabilities: true, router: true});
    const {userEvent} = render(
      <>
        <EntitiesTable
          entities={entities}
          links={false}
          pagination={false}
          row={Row}
          rowDetails={Details}
        />
        <EntitiesTable
          entities={entities}
          links={false}
          pagination={false}
          row={Row}
          rowDetails={Details}
        />
      </>,
    );
    const buttons = screen.getAllByRole('button', {name: /preview for First/});
    for (const button of buttons) await userEvent.click(button);
    const ids = buttons.map(button => button.getAttribute('aria-controls'));
    expect(new Set(ids).size).toBe(2);
    for (const id of ids) {
      await waitFor(() => {
        expect(document.getElementById(id ?? '')).toHaveTextContent(
          'Details for First',
        );
      });
    }
  });

  test('collapses details when paginating', async () => {
    const onNextClick = testing.fn();
    const {render} = rendererWith({capabilities: true, router: true});
    const table = (page: Model[]) => (
      <EntitiesTable
        entities={page}
        footnote={false}
        links={false}
        pagination={Pagination}
        row={Row}
        rowDetails={Details}
        onNextClick={onNextClick}
      />
    );
    const {userEvent, rerender} = render(table(entities));
    const first = screen.getByRole('button', {name: /preview for First/});
    await userEvent.click(first);
    const id = first.getAttribute('aria-controls') ?? '';
    expect(document.getElementById(id)).toBeInTheDocument();
    await userEvent.click(
      screen.getAllByRole('button', {name: 'Next page'})[0],
    );
    expect(onNextClick).toHaveBeenCalledOnce();
    rerender(table([entities[1]]));
    rerender(table(entities));
    expect(document.getElementById(id)).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /preview for First/}),
    ).toHaveAttribute('aria-expanded', 'false');
  });

  test('applies the same link policy to the name and its preview', async () => {
    const {render} = rendererWith({capabilities: true, router: true});
    const {userEvent} = render(
      <EntitiesTable
        entities={entities}
        links={false}
        pagination={false}
        row={Row}
        rowDetails={Details}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', {name: /preview for First/}),
    );
    expect(await screen.findByText('Details for First')).toBeVisible();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  test('removes the preview row when closed before opening starts', () =>
    withMotion(async () => {
      const {render} = rendererWith({capabilities: true, router: true});
      render(
        <EntitiesTable
          entities={entities}
          links={false}
          pagination={false}
          row={Row}
          rowDetails={Details}
        />,
      );
      const button = screen.getByRole('button', {name: /preview for First/});
      fireEvent.click(button);
      const id = button.getAttribute('aria-controls') ?? '';
      expect(document.getElementById(id)).toBeInTheDocument();
      expect(screen.queryByText('Details for First')).not.toBeInTheDocument();

      fireEvent.click(button);
      expect(document.getElementById(id)).not.toBeInTheDocument();
      expect(button).not.toHaveAttribute('aria-controls');
    }));

  test('opens and closes reduced motion previews without waiting for a frame', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    render(
      <EntitiesTable
        entities={entities}
        links={false}
        pagination={false}
        row={Row}
        rowDetails={Details}
      />,
    );
    const button = screen.getByRole('button', {name: /preview for First/});
    fireEvent.click(button);
    const id = button.getAttribute('aria-controls') ?? '';
    expect(document.getElementById(id)).toHaveTextContent('Details for First');

    fireEvent.click(button);
    expect(document.getElementById(id)).not.toBeInTheDocument();
    expect(button).not.toHaveAttribute('aria-controls');
  });

  test('drops a closing preview if its row is filtered out', () =>
    withMotion(async () => {
      const {render} = rendererWith({capabilities: true, router: true});
      const table = (visible: Model[]) => (
        <EntitiesTable
          entities={visible}
          links={false}
          pagination={false}
          row={Row}
          rowDetails={Details}
        />
      );
      const {rerender} = render(table(entities));
      const button = screen.getByRole('button', {name: /preview for First/});
      fireEvent.click(button);
      await screen.findByText('Details for First');
      const id = button.getAttribute('aria-controls') ?? '';

      fireEvent.click(button);
      expect(document.getElementById(id)).toBeInTheDocument();
      rerender(table([entities[1]]));
      rerender(table(entities));
      expect(document.getElementById(id)).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: /preview for First/}),
      ).not.toHaveAttribute('aria-controls');
    }));

  test('ignores an exit callback after the preview has reopened', () => {
    const ControlledDetails = ({
      detailsId,
      entity,
      onPreviewExited,
    }: {
      detailsId?: string;
      entity: Model;
      onPreviewExited?: (id: string) => void;
    }) => (
      <tr
        id={detailsId}
        onTransitionEnd={() => onPreviewExited?.(entity.id ?? '')}
      >
        <td>Details</td>
      </tr>
    );
    const {render} = rendererWith({capabilities: true, router: true});
    render(
      <EntitiesTable
        entities={entities}
        links={false}
        pagination={false}
        row={Row}
        rowDetails={ControlledDetails}
      />,
    );
    const button = screen.getByRole('button', {name: /preview for First/});
    fireEvent.click(button);
    const details = screen.getByRole('row', {name: 'Details'});
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    fireEvent.transitionEnd(details);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(details).toBeInTheDocument();
  });

  test('does not offer expansion without a details component', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    render(
      <EntitiesTable
        entities={entities}
        footnote={false}
        links={false}
        pagination={false}
        row={Row}
      />,
    );
    expect(screen.getByText('First')).toBeVisible();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('shows the chevron only in the name cell that receives a preview', async () => {
    const RowWithTwoNames = ({
      entity,
      links,
      preview,
    }: RowComponentProps<Model>) => (
      <tr>
        <td>
          <TableEntityName
            id={entity.id}
            links={links}
            preview={preview}
            type="target"
          >
            {entity.name}
          </TableEntityName>
        </td>
        <td>
          <TableEntityName id={entity.id} links={links} type="target">
            Related name
          </TableEntityName>
        </td>
      </tr>
    );
    const {render} = rendererWith({capabilities: true, router: true});
    const {userEvent} = render(
      <EntitiesTable
        entities={[entities[0]]}
        links={false}
        pagination={false}
        row={RowWithTwoNames}
        rowDetails={Details}
      />,
    );

    const [name, relatedName] = screen.getAllByRole('cell');
    const button = within(name).getByRole('button', {
      name: 'Show preview for First',
    });
    expect(within(relatedName).queryByRole('button')).not.toBeInTheDocument();
    await userEvent.click(button);
    expect(await screen.findByText('Details for First')).toBeVisible();
  });
});
