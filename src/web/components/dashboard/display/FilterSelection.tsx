/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {connect} from 'react-redux';
import type Gmp from 'gmp/gmp';
import type Filter from 'gmp/models/filter';
import {hasValue, isDefined} from 'gmp/utils/identity';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import {loadEntities, selector} from 'web/store/entities/filters';
import compose from 'web/utils/compose';
import {
  type RenderSelectItemProps,
  renderSelectItems,
  UNSET_VALUE,
} from 'web/utils/Render';
import withGmp from 'web/utils/withGmp';
import withTranslation from 'web/utils/withTranslation';

interface FilterSelectionRenderProps {
  filter?: Filter;
  selectFilter: () => void;
}

interface StateProps {
  filters?: Filter[];
}

interface DispatchProps {
  loadFilters: () => void;
}

interface TranslationProps {
  _: (text: string) => string;
}

interface FilterSelectionProps
  extends StateProps, DispatchProps, TranslationProps {
  children: (props: FilterSelectionRenderProps) => React.ReactNode;
  filterId?: string;
  filtersFilter: Filter;
  onFilterIdChanged?: (filterId: string | undefined) => void;
}

interface FilterSelectionState {
  showDialog: boolean;
}

class FilterSelection extends React.Component<
  FilterSelectionProps,
  FilterSelectionState
> {
  constructor(props: FilterSelectionProps) {
    super(props);

    this.state = {
      showDialog: false,
    };

    this.handleCloseDialog = this.handleCloseDialog.bind(this);
    this.handleOpenDialog = this.handleOpenDialog.bind(this);
    this.handleSaveDialog = this.handleSaveDialog.bind(this);
  }

  componentDidMount() {
    this.props.loadFilters();
  }

  closeDialog() {
    this.setState({showDialog: false});
  }

  handleCloseDialog() {
    this.closeDialog();
  }

  handleOpenDialog() {
    this.setState({showDialog: true});
  }

  handleSaveDialog({filterId = UNSET_VALUE}: {filterId?: string}) {
    const {onFilterIdChanged} = this.props;

    this.closeDialog();

    if (isDefined(onFilterIdChanged)) {
      onFilterIdChanged(filterId === UNSET_VALUE ? undefined : filterId);
    }
  }

  render() {
    const {_} = this.props;

    const {children, filters = [], filterId} = this.props;
    const {showDialog} = this.state;
    const filter = isDefined(filterId)
      ? filters.find(f => f.id === filterId)
      : undefined;

    return (
      <>
        {children({
          filter,
          selectFilter: this.handleOpenDialog,
        })}
        {showDialog && (
          <SaveDialog
            buttonTitle={_('Select')}
            defaultValues={{
              filterId: isDefined(filterId) ? filterId : UNSET_VALUE,
            }}
            title={_('Select Filter')}
            width="500px"
            onClose={this.handleCloseDialog}
            onSave={this.handleSaveDialog}
          >
            {({values, onValueChange}) => (
              <FormGroup title={_('Filter')}>
                <Select
                  items={renderSelectItems(
                    filters as RenderSelectItemProps[],
                    UNSET_VALUE,
                  )}
                  name="filterId"
                  value={values.filterId}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}
          </SaveDialog>
        )}
      </>
    );
  }
}

const mapStateToProps = (
  state: unknown,
  {filtersFilter}: {filtersFilter: Filter},
): StateProps => {
  if (!isDefined(filtersFilter)) {
    return {
      filters: [],
    };
  }

  const filterSelector = selector(state);
  const filters: Filter[] = filterSelector.getEntities(filtersFilter);

  return {
    filters: hasValue(filters) ? filters : [],
  };
};

const mapDispatchToProps = (
  dispatch: unknown,
  {gmp, filtersFilter}: {gmp: Gmp; filtersFilter: Filter},
): DispatchProps => ({
  // @ts-expect-error dispatch is a redux thunk
  loadFilters: () => dispatch(loadEntities(gmp)(filtersFilter)),
});

export default compose(
  withTranslation,
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(FilterSelection);
