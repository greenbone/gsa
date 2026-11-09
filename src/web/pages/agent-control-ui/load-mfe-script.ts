/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const SCRIPT_ID = 'ac-inventory-mfe';
const REGISTRATION_TIMEOUT = 10_000;

let scriptLoad: Promise<void> | undefined;

const loadMfeScript = (src: string, elementName: string): Promise<void> => {
  if (customElements.get(elementName)) {
    return Promise.resolve();
  }
  if (!scriptLoad) {
    document.getElementById(SCRIPT_ID)?.remove();
    scriptLoad = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      let settled = false;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const fail = () => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);
        script.remove();
        scriptLoad = undefined;
        reject(
          new Error('Inventory script failed to load or register its element'),
        );
      };
      script.id = SCRIPT_ID;
      script.src = src;
      script.addEventListener(
        'load',
        () => {
          timer = setTimeout(fail, REGISTRATION_TIMEOUT);
          void customElements.whenDefined(elementName).then(() => {
            if (!settled) {
              settled = true;
              clearTimeout(timer);
              resolve();
            }
          }, fail);
        },
        {once: true},
      );
      script.addEventListener('error', fail, {once: true});
      document.head.appendChild(script);
    });
  }
  return scriptLoad;
};

export default loadMfeScript;
