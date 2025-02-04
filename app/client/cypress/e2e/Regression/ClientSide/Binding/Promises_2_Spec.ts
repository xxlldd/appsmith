import { ObjectsRegistry } from "../../../../support/Objects/Registry";

const agHelper = ObjectsRegistry.AggregateHelper,
  ee = ObjectsRegistry.EntityExplorer,
  jsEditor = ObjectsRegistry.JSEditor,
  locator = ObjectsRegistry.CommonLocators,
  apiPage = ObjectsRegistry.ApiPage,
  deployMode = ObjectsRegistry.DeployMode,
  propPane = ObjectsRegistry.PropertyPane;

describe("Validate basic Promises", () => {
  beforeEach(() => {
    agHelper.RestoreLocalStorageCache();
  });

  afterEach(() => {
    agHelper.SaveLocalStorageCache();
  });

  it("1. Verify storeValue via .then via direct Promises", () => {
    const date = new Date().toDateString();
    cy.fixture("promisesBtnDsl").then((val: any) => {
      agHelper.AddDsl(val, locator._spanButton("Submit"));
    });
    ee.SelectEntityByName("Button1", "Widgets");
    propPane.EnterJSContext(
      "onClick",
      "{{storeValue('date', Date()).then(() => showAlert(appsmith.store.date))}}",
    );
    deployMode.DeployApp();
    agHelper.ClickButton("Submit");
    agHelper.ValidateToastMessage(date);
    deployMode.NavigateBacktoEditor();
  });

  it("2. Verify resolve & chaining via direct Promises", () => {
    cy.fixture("promisesBtnDsl").then((val: any) => {
      agHelper.AddDsl(val, locator._spanButton("Submit"));
    });
    ee.SelectEntityByName("Button1", "Widgets");
    propPane.EnterJSContext(
      "onClick",
      `{{
          new Promise((resolve) => {
            resolve("We are on planet")
          }).then((res) => {
            return res + " Earth"
          }).then((res) => {
            showAlert(res, 'success')
          }).catch(err => { showAlert(err, 'error') });
        }}`,
    );
    deployMode.DeployApp();
    agHelper.ClickButton("Submit");
    agHelper.ValidateToastMessage("We are on planet Earth");
    deployMode.NavigateBacktoEditor();
  });

  it("3. Verify Promises.any via direct JSObjects", () => {
    cy.fixture("promisesBtnDsl").then((val: any) => {
      agHelper.AddDsl(val, locator._spanButton("Submit"));
    });
    jsEditor.CreateJSObject(
      `export default {
      func2: async () => {
     return Promise.reject(new Error('fail')).then(showAlert("Promises reject from func2"));
    },
      func1: async () => {
      showAlert("In func1")
      return "func1"
    },
    func3: async () => {
      showAlert("In func3")
      return "func3"
    },
    runAny: async () => {
      return Promise.any([this.func2(), this.func3(), this.func1()]).then((value) => showAlert("Resolved promise is:" + value))
    }
    }`,
      {
        paste: true,
        completeReplace: true,
        toRun: false,
        shouldCreateNewJSObj: true,
      },
    );
    ee.SelectEntityByName("Button1", "Widgets");
    cy.get("@jsObjName").then((jsObjName) => {
      propPane.EnterJSContext("onClick", "{{" + jsObjName + ".runAny()}}");
    });
    deployMode.DeployApp();
    agHelper.ClickButton("Submit");
    agHelper.AssertElementLength(locator._toastMsg, 4);
    agHelper.ValidateToastMessage("Promises reject from func2", 0);
    agHelper.ValidateToastMessage("Resolved promise is:func3", 3); //Validating last index
  });

  it("4. Bug : 11110 - Verify resetWidget via .then direct Promises", () => {
    deployMode.NavigateBacktoEditor();
    cy.fixture("promisesBtnDsl").then((dsl: any) => {
      agHelper.AddDsl(dsl, locator._spanButton("Submit"));
    });
    ee.SelectEntityByName("Button1", "Widgets");
    propPane.EnterJSContext(
      "onClick",
      "{{resetWidget('Input1').then(() => showAlert(Input1.text))}}",
    );
    deployMode.DeployApp(locator._widgetInputSelector("inputwidgetv2"));
    agHelper.TypeText(
      locator._widgetInputSelector("inputwidgetv2"),
      "Update value",
    );
    agHelper.ClickButton("Submit");
    agHelper.ValidateToastMessage("Test");
  });
});
