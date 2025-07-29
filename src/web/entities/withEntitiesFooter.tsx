/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

interface EntitiesFooterWrapperProps {
  onDeleteBulk?: () => void;
  onDownloadBulk?: () => void;
  onTagsBulk?: () => void;
  onTrashBulk?: () => void;
}

/**
 * Props for the component passed to withEntitiesFooter gets provided.
 */
export interface WithEntitiesFooterComponentProps {
  onDeleteClick?: () => void;
  onDownloadClick?: (filename: string) => void;
  onTagsClick?: () => void;
  onTrashClick?: () => void;
}

/**
 * Props for the wrapper component created by withEntitiesFooter.
 */
type WithEntitiesFooterProps<TProps> = EntitiesFooterWrapperProps &
  Omit<
    TProps,
    keyof EntitiesFooterWrapperProps | keyof WithEntitiesFooterComponentProps
  >;

export function withEntitiesFooter<
  TProps extends
    WithEntitiesFooterComponentProps = WithEntitiesFooterComponentProps,
  TOptions = {},
>(options: TOptions = {} as TOptions) {
  return (Component: React.ComponentType<TProps>) => {
    const EntitiesFooterWrapper = ({
      onDownloadBulk,
      onDeleteBulk,
      onTagsBulk,
      ...props
    }: WithEntitiesFooterProps<TProps>) => {
      return (
        <Component
          {...(options as TOptions)}
          {...(props as TProps)}
          onDeleteClick={onDeleteBulk}
          onDownloadClick={onDownloadBulk}
          onTagsClick={onTagsBulk}
          onTrashClick={onDeleteBulk}
        />
      );
    };

    return EntitiesFooterWrapper;
  };
}

export default withEntitiesFooter;
