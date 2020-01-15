class Timer extends JSXE.Component {
  constructor(props) {
    super(props);
    this.state = {time: 0};
    setTimeout(_ => this.tick(), 1000);
  }
  render() {
    return (<div>{this.state.time}</div>);
  }
  tick() {
    this.setState({time: this.state.time+1});
  }
}
JSXE.renderComponent = <Timer/>;