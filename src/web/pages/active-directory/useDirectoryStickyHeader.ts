/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useLayoutEffect, useRef} from 'react';

const useDirectoryStickyHeader = (listingVersion: number) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const area = ref.current;
    if (!area || !document.elementsFromPoint) return;
    const main = area.closest('main');
    let activeHeader: Element | null = null;
    let topPadding = '';
    let frame = 0;
    const getScrollport = () =>
      getComputedStyle(area).overflowY === 'auto' ? area : main;

    const update = () => {
      frame = 0;
      if (
        activeHeader?.contains(document.activeElement) &&
        !activeHeader.closest('li')?.hasAttribute('data-directory-branch-open')
      ) {
        activeHeader.removeAttribute('data-directory-header-sticky');
        activeHeader.scrollIntoView({block: 'nearest', inline: 'nearest'});
      }
      const scrollport = getScrollport();
      const bounds = scrollport?.getBoundingClientRect();
      let branch: Element | undefined;
      if (scrollport && bounds) {
        const top = bounds.top + scrollport.clientTop;
        const x =
          bounds.left + scrollport.clientLeft + scrollport.clientWidth / 2;

        // Hit testing includes the content behind the currently sticky header.
        // Check the branch's own bounds to exclude headers already pushed out.
        for (const hit of document.elementsFromPoint(x, top + 1)) {
          const owner = hit.closest('[data-directory-branch-open]');
          if (
            !owner ||
            !area.contains(owner) ||
            (branch && !branch.contains(owner))
          )
            continue;

          const section = owner.getBoundingClientRect();
          if (section.top <= top && section.bottom > top) branch = owner;
        }
      }

      const header =
        branch?.querySelector('[data-directory-branch-header]') ?? null;
      if (header && scrollport) {
        const padding = getComputedStyle(scrollport).paddingBlockStart;
        if (padding !== topPadding) {
          area.style.setProperty('--directory-sticky-top-padding', padding);
          topPadding = padding;
        }
      }
      if (header !== activeHeader) {
        activeHeader?.removeAttribute('data-directory-header-sticky');
        header?.setAttribute('data-directory-header-sticky', '');
        activeHeader = header;
      }
    };
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };
    const revealFocusedControl = (event: FocusEvent) => {
      const target = event.target;
      if (
        !(target instanceof Element) ||
        !activeHeader ||
        activeHeader.contains(target)
      )
        return;
      const header = activeHeader.getBoundingClientRect();
      const control = target.getBoundingClientRect();
      if (control.top < header.bottom && control.bottom > header.top) {
        getScrollport()?.scrollBy(0, control.top - header.bottom);
      }
    };

    const branches = new MutationObserver(schedule);
    branches.observe(area, {
      attributes: true,
      attributeFilter: ['data-directory-branch-open'],
      subtree: true,
    });
    const resize = new ResizeObserver(schedule);
    resize.observe(area);
    if (main) resize.observe(main);
    area.addEventListener('scroll', schedule, {passive: true});
    area.addEventListener('focusin', revealFocusedControl);
    main?.addEventListener('scroll', schedule, {passive: true});
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      activeHeader?.removeAttribute('data-directory-header-sticky');
      area.style.removeProperty('--directory-sticky-top-padding');
      branches.disconnect();
      resize.disconnect();
      area.removeEventListener('scroll', schedule);
      area.removeEventListener('focusin', revealFocusedControl);
      main?.removeEventListener('scroll', schedule);
    };
  }, [listingVersion]);

  return ref;
};

export default useDirectoryStickyHeader;
