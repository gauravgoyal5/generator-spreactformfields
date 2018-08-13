// import 'core-js/shim';
import * as React from 'react';
import { sp } from '@pnp/sp';
import { FormMode, getQueryString, executeSPQuery, IListFormProps, setupPnp } from 'sp-react-formfields/lib/interfaces';
import { FormFieldLabel } from 'sp-react-formfields/lib/fields/FormFieldLabel';

export class RootInternal extends React.Component<{ }, { formProps: IListFormProps, form: any, formField: any }> {
  private localContext = null;

  public constructor(props) {
    super(props);
    this.localContext = SP.ClientContext.get_current();
    this.state = {
      formProps: null,
      form: null,
      formField: null
    };
  }

  public componentDidMount() {
    const promise = this.createInitialProps();
    promise.then(formProps => {
      this.setState({ formProps });
    });
    import('sp-react-formfields/lib/ListForm').then(({ ListForm }) => {
      this.setState({ form: ListForm });
    });
    import('sp-react-formfields/lib/fields/FormField').then(({ FormField }) => {
      this.setState({ formField: FormField });
    });
  }

  public render() {
    if (!this.state.formProps || !this.state.form) {
      return null;
    }

    const ListForm = this.state.form;
    const FormField = this.state.formField;
    return (
      <div>
        <ListForm { ...this.state.formProps }>
          {this.renderCustomFieldLogic(FormField)}
        </ListForm>
      </div>
    );
  }

  private renderCustomFieldLogic(FormField: any): JSX.Element {
    let result = null;
    if (!FormField) return result;

    /* Include any JSX here, and also use (FormMode parameter is optional, if not spcified - defaults to new form)
      - <FormField InternalName='FieldInternalNameString' FormMode={this.state.formProps.CurrentMode} />
      - <FormFieldLabel InternalName='FieldInternalNameString' />
      or call this.createFormRowMarkup method to easily instantiate a row with both label and form field included

      to create a custom form.
      If nothing is populated in this area - ListForm component will just render all valid fields one by one as default */
    // result = (
    //   <React.Fragment>
    //      {this.createFormRowMarkup(FormField, 'Title')} {/* <-- this will render a row for Title field */} 
    //   </React.Fragment>
    // );

    return result;
  }

  private createFormRowMarkup(FormField: any, internalName: string): JSX.Element {
    return (
      <div className='formRow' key={`formRow_${internalName}`}>
        <div className='rowLabel' key={`formLabelContainer_${internalName}`}>
          <FormFieldLabel key={`formFieldLabel_${internalName}`} InternalName={internalName} />
        </div>
        <div className='rowField' key={`formFieldContainer_${internalName}`}>
          <FormField key={`formfield_${internalName}`} InternalName={internalName} FormMode={this.state.formProps.CurrentMode} />
        </div>
      </div>
    );
  }

  private createInitialProps = async (): Promise<IListFormProps> => {
    let currentWeb = this.localContext.get_web();
    this.localContext.load(currentWeb);
    await executeSPQuery(this.localContext);
    let webUrl = currentWeb.get_url();

    setupPnp(sp, webUrl);

    return {
      pnpSPRest: sp,
      Fields: [],
      CurrentMode: this.getFormMode(),
      CurrentListId: this.getCurrentListId(),
      CurrentItemId: this.getCurrentItemId(),
      ContentTypeId: this.getContentTypeId(),
      SpWebUrl: webUrl,
      IsLoading: true
    } as IListFormProps;
  }

  private getFormMode = () => {
    let fm = getQueryString(null, 'fm');
    if (fm != null) {
      return parseInt(fm, 10);
    }
    if (window.location.href.match(/editform/gi)) {
      return FormMode.Edit;
    }
    if (window.location.href.match(/dispform/gi)) {
      return FormMode.Display;
    }
    return FormMode.New;
  }

  private getContentTypeId = () => {
    return getQueryString(null, 'ContentTypeId');
  }

  private getCurrentListId = () => {
    let listid = getQueryString(null, 'listid');
    if (!listid) {
      if (window['_spPageContextInfo'] && window['_spPageContextInfo'].pageListId) {
        listid = window['_spPageContextInfo'].pageListId;
      }
    }
    return listid;
  }

  private getCurrentItemId = () => {
    let itemid = getQueryString(null, 'itemid');
    if (itemid == null) {
      itemid = getQueryString(null, 'id');
    }
    if (itemid == null) {
      return 0;
    } else {
      return parseInt(itemid, 10);
    }
  }
}

export default (<RootInternal />);
