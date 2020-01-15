class Timer extends JSXE.Component {
  constructor(props) {
    super(props);
    this.state = {time: 0};
    setInterval(_ => this.tick(), 1000);
  }
  render() {
    return JSXE.createElement("div", {}, [""+this.state.time]);
  }
  tick() {
    this.setState({time: this.state.time+1});
  }
}
JSXE.renderComponent = JSXE.createElement(Timer);