/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const getOperatingSystemNameFromCpe = (cpe?: string): string | undefined => {
  if (!cpe) {
    return undefined;
  }

  const fields: string[] = [];
  let field = '';
  let escaped = false;

  for (const character of cpe) {
    if (escaped) {
      field += `\\${character}`;
      escaped = false;
    } else if (character === '\\') {
      escaped = true;
    } else if (character === ':') {
      fields.push(field);
      field = '';
    } else {
      field += character;
    }
  }
  fields.push(field);

  if (
    escaped ||
    fields.length !== 13 ||
    fields[0] !== 'cpe' ||
    fields[1] !== '2.3' ||
    fields[2] !== 'o' ||
    fields.some(value => value.length === 0)
  ) {
    return undefined;
  }

  const product = fields[4];
  if (product === '*' || product === '-') {
    return undefined;
  }

  return product.replace(/\\(.)/g, '$1').replace(/_/g, ' ');
};

export default getOperatingSystemNameFromCpe;
