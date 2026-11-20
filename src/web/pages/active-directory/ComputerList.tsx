/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {defaultRangeExtractor, useVirtualizer} from '@tanstack/react-virtual';
import {type DirectoryComputer} from 'gmp/models/active-directory';
import {DEFAULT_ROWS_PER_PAGE} from 'gmp/models/filter';
import ComputerRow from 'web/pages/active-directory/ComputerRow';
import {DirectoryList} from 'web/pages/active-directory/DirectoryLayout';

interface ComputerListProps {
  computers: DirectoryComputer[];
  depth: number;
  selectedIds: ReadonlySet<string>;
  selectionPending: boolean;
  sourceId: string;
  onSelect: (node: DirectoryComputer, checked: boolean) => void;
}

interface ScrollLayout {
  element: HTMLElement | null;
  margin: number;
  gap: number;
}

const initialLayout: ScrollLayout = {element: null, margin: 0, gap: 0};

const ComputerList = ({
  computers,
  depth,
  selectedIds,
  selectionPending,
  sourceId,
  onSelect,
}: ComputerListProps) => {
  const virtual = computers.length > DEFAULT_ROWS_PER_PAGE;
  const listRef = useRef<HTMLUListElement>(null);
  const [layout, setLayout] = useState(initialLayout);
  const [focusedId, setFocusedId] = useState<string>();
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!virtual || !list) return;

    const directory = list.closest<HTMLElement>('[data-directory-scroll-area]');
    const main = list.closest<HTMLElement>('main');
    const measureLayout = () => {
      const element =
        directory && getComputedStyle(directory).overflowY === 'auto'
          ? directory
          : main;
      const margin = element
        ? list.getBoundingClientRect().top -
          element.getBoundingClientRect().top +
          element.scrollTop -
          element.clientTop
        : 0;
      const gap = parseFloat(getComputedStyle(list).rowGap) || 0;
      setLayout(previous =>
        previous.element === element &&
        previous.margin === margin &&
        previous.gap === gap
          ? previous
          : {element, margin, gap},
      );
    };

    // Earlier branches and alerts can shift a list without resizing the viewport.
    const observer = new ResizeObserver(measureLayout);
    for (
      let ancestor: HTMLElement | null = list;
      ancestor;
      ancestor = ancestor.parentElement
    ) {
      observer.observe(ancestor);
      if (ancestor === main) break;
      for (
        let sibling = ancestor.previousElementSibling;
        sibling;
        sibling = sibling.previousElementSibling
      ) {
        observer.observe(sibling);
      }
    }
    measureLayout();
    window.addEventListener('resize', measureLayout);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measureLayout);
    };
  }, [virtual]);

  const indexById = useMemo(
    () => new Map(computers.map((computer, index) => [computer.id, index])),
    [computers],
  );
  if (focusedId !== undefined && !indexById.has(focusedId)) {
    setFocusedId(undefined);
  }
  if ([...expandedIds].some(id => !indexById.has(id))) {
    setExpandedIds(new Set([...expandedIds].filter(id => indexById.has(id))));
  }

  const getItemKey = useCallback(
    (index: number) => computers[index].id,
    [computers],
  );
  const onExpandedChange = useCallback((id: string, expanded: boolean) => {
    setExpandedIds(previous => {
      const next = new Set(previous);
      if (expanded) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);
  const onFocusChange = useCallback((id: string, focused: boolean) => {
    setFocusedId(previous => {
      if (focused) return id;
      return previous === id ? undefined : previous;
    });
  }, []);

  // oxlint-disable-next-line react/incompatible-library -- TanStack Virtual exposes live scroll measurements.
  const virtualizer = useVirtualizer({
    count: computers.length,
    enabled: virtual,
    estimateSize: () => 64,
    gap: layout.gap,
    getItemKey,
    getScrollElement: () => layout.element,
    overscan: 5,
    scrollMargin: layout.margin,
    rangeExtractor: (range): number[] => {
      // Keep entry points for Tab in either direction, even for offscreen lists.
      const indexes = new Set([0, computers.length - 1]);
      const start = virtualizer.scrollOffset ?? 0;
      const end = start + (virtualizer.scrollRect?.height ?? 0);
      if (
        end > layout.margin &&
        start < layout.margin + virtualizer.getTotalSize()
      ) {
        for (const index of defaultRangeExtractor(range)) indexes.add(index);
      }
      for (const id of expandedIds) {
        const index = indexById.get(id);
        if (index !== undefined) indexes.add(index);
      }
      const focusedIndex =
        focusedId === undefined ? undefined : indexById.get(focusedId);
      if (focusedIndex !== undefined) {
        // The native Tab order reaches the next logical row at a window boundary.
        for (const index of [
          focusedIndex - 1,
          focusedIndex,
          focusedIndex + 1,
        ]) {
          if (index >= 0 && index < computers.length) indexes.add(index);
        }
      }
      return [...indexes].sort((a, b) => a - b);
    },
  });

  const virtualItems = virtual ? virtualizer.getVirtualItems() : [];

  return (
    <DirectoryList
      ref={listRef}
      $spacing="xs"
      style={virtual ? {overflowAnchor: 'none'} : undefined}
    >
      {(virtual ? virtualItems : computers).map((item, index) => {
        const virtualIndex = 'index' in item ? item.index : undefined;
        const node = 'index' in item ? computers[item.index] : item;
        const previous = virtualItems[index - 1];
        // Keep mounted rows in flow so a disclosure immediately pushes its
        // neighbors down. Reserve space only for rows omitted by the window.
        const spaceBefore =
          'index' in item && previous && item.index > previous.index + 1
            ? item.start - previous.end - layout.gap
            : undefined;
        return (
          <ComputerRow
            key={node.id}
            checked={selectedIds.has(node.id)}
            depth={depth}
            measure={virtual ? virtualizer.measureElement : undefined}
            node={node}
            selectionPending={selectionPending}
            sourceId={sourceId}
            spaceBefore={spaceBefore}
            virtualIndex={virtualIndex}
            virtualTotal={virtual ? computers.length : undefined}
            onExpandedChange={onExpandedChange}
            onFocusChange={onFocusChange}
            onSelect={onSelect}
          />
        );
      })}
    </DirectoryList>
  );
};

export default ComputerList;
