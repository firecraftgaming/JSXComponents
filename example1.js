class ShoppingList extends JSXE.Component {
  render() {
    return (
      JSXE.createElement("div", {class: "shopping-list"}, [
        JSXE.createElement("h1", {}, [`Shopping List for ${this.props.name}`]),
        JSXE.createElement("ul", {}, [
          JSXE.createElement("li", {}, "Instagram"),
          JSXE.createElement("li", {}, "WhatsApp"),
          JSXE.createElement("li", {}, "Oculus")
        ])
      ])
    );
  }
}
JSXE.renderComponent = JSXE.createElement(ShoppingList, {name: "Person"});