/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import tagStyles from 'web/components/form/tagStyles';
import Layout from 'web/components/layout/Layout';

interface TagListDisplayProps {
  values: string[];
  color?: keyof typeof tagStyles;
}

const Tag = styled.span<{bg: string; color: string}>`
  background-color: ${({bg}) => bg};
  color: ${({color}) => color};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: 500;
  margin-right: 3px;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
`;

const TagListDisplay = ({values, color = 'green'}: TagListDisplayProps) => {
  const resolvedColor = tagStyles[color] ?? tagStyles.green;

  return (
    <TagList>
      {values.map((val, idx) => (
        <Layout key={idx + val} style={{display: 'flex', alignItems: 'center'}}>
          <Tag bg={resolvedColor.bg} color={resolvedColor.color}>
            {val}
          </Tag>
        </Layout>
      ))}
    </TagList>
  );
};

export default TagListDisplay;
