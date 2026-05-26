/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import FormGroup from 'web/components/form/FormGroup';
import TextField from 'web/components/form/TextField';
import useTranslation from 'web/hooks/useTranslation';
import addPrefix from 'web/utils/add-prefix';

interface HttpMethodPartProps {
  prefix?: string;
  URL: string;
  onChange: (value: string, name?: string) => void;
}

const HttpMethodPart = ({
  prefix: initialPrefix,
  URL,
  onChange,
}: HttpMethodPartProps) => {
  const [_] = useTranslation();
  const prefix = addPrefix(initialPrefix);
  return (
    <FormGroup htmlFor="http-url" title={_('HTTP Get URL')}>
      <TextField
        grow="1"
        id="http-url"
        name={prefix('URL')}
        value={URL}
        onChange={onChange}
      />
    </FormGroup>
  );
};

export default HttpMethodPart;
