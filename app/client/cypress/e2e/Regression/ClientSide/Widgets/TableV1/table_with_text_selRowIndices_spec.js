const widgetsPage = require("../../../../../locators/Widgets.json");
const commonlocators = require("../../../../../locators/commonlocators.json");
import * as _ from "../../../../../support/Objects/ObjectsCore";

describe("Table widget edge case scenario testing", function () {
  before(() => {
    cy.fixture("tableWithTextWidgetDsl").then((val) => {
      _.agHelper.AddDsl(val);
    });
  });
  it("Check if the selectedRowIndices does not contain -1", function () {
    cy.openPropertyPane("tablewidget");

    //Update the property default selected row to blank
    cy.updateCodeInput(".t--property-control-defaultselectedrow", "");

    // ensure evaluated value popup does not show up
    cy.get(commonlocators.evaluatedCurrentValue).should("not.exist");

    //Check the value present in the textfield which is selectedRowIndices is blank
    cy.get(`${widgetsPage.textWidget} .bp3-ui-text`).should("have.text", "");

    //Enable the "Enable Multi Row selection"
    cy.get(widgetsPage.toggleEnableMultirowselection_tablev1)
      .first()
      .click({ force: true });

    //Check the value present in the textfield which is selectedRowIndices is []
    cy.get(`${widgetsPage.textWidget} .bp3-ui-text`).should("have.text", "[]");

    //Select the 1st, 2nd and 3rd row
    cy.isSelectRow("0");
    cy.isSelectRow("1");
    cy.isSelectRow("2");

    //Check the value present in the textfield which is selectedRowIndices is [0,1,2]
    cy.get(`${widgetsPage.textWidget} .bp3-ui-text`).should(
      "have.text",
      "[  0,  1,  2]",
    );
  });
});
//
