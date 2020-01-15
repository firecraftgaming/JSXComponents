// Copyright Eliyah Sundström ©2020 All rights reserved 
String.prototype.remove = (s, e) => {
  return [this.substr(0, s), this.substr(e)];
}
String.prototype.JSXParse = _ => {
  
}
String.prototype.toFunction = _ => {
  return new Function(this)();
}
var JSXElements = {};
var JSXE = JSXElements;

window.onload = _ => {
  var reactScripts = document.getElementsByTagName("jsx");
  var scripts = [];
  function loadScripts(S, c, r, i, p, t, s) {
    Array.from(reactScripts).forEach(v => {
      S = v.innerHTML;
      v.innerHTML = "";
      if (v.hasAttribute("src")) {
        c = new XMLHttpRequest();
        r = v.getAttribute("src");
        if (r.startsWith("/")) {
          var i = window.location.href;
          if (i.endsWith("/")) i.split("").pop();
          i.join("");
          r = i+r;
        }
        c.open("GET", r, false);
        c.send();
        S = c.responseText;
      }
      scripts.push(S);
    });
  }
  function escape(s) {
    return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }
  function fixChilds(text, elements, o) {
    if (elements[o][0].endsWith("/")) {
      elements[o][2] = [];
      return;
    }
    var level = 0;
    var end;
    for (var i = o; i < elements.length; i++) {
      if (elements[i][0] == elements[o][0]) level++;
      if (elements[i][0] == "/"+elements[o][0]) level--;
      if (elements[i][0] == "/"+elements[o][0] && level == 0) end = i;
    }
    text = text;
    var children = elements.splice(o+1, end-o);
    children.map(v => fixChilds(v));
    var ep = getEndOfElement(text, elements[o][3])+1;
    var tt = text.slice(ep, children.pop()[3]-ep);
    var nchildren = [];
    children.forEach((v, i) => {
      
    });

    children = nchildren;
    [].push.apply(elements[o][2].children, children);
  }
  function getEndOfElement(text, o) {
    var string = false;
    var c = 1;
    for (var i = o+1; i < text.length; i++) {
      c++;
      if (text[i] == "\"") string = !string;
      if (text[i] == ">" && !string) return c;
    }
    return -1;
  }
  function formalize(t) {
    return JSON.parse('{"a":'+t+"}").a;
  }
  function parseElement(text, i) {
   
    var start = i+1;
    var length = getEndOfElement(text, i)-2;
    var args = [];
    function split(str) {
      var string = false;
      var string2 = false;
      var bracks = false;
      var str = str.split(" ");
      console.log(str);
      for (var i = 0; i < str.length; i++) {
        var v = str[i];
        if (string || string2 || bracks) {
          str.splice(i-1, 2, [str[i-1], v].join(" "));
          i--;
        }
        if (v.indexOf('"') > -1) string = !string;
        if (v.indexOf("'") > -1) string2 = !string2;
        if (v.indexOf("{") > -1) bracks = true;
        if (v.indexOf("}") > -1) bracks = false;
      }
      console.log(str);
      return str;
    }
    split(text.substr(start, length)).forEach(v => {
      if (v != "") args.push(v);
    });
    //Args
    var name = args.shift();
    var parameters = {};
    var children = [];
    args.forEach(o => {
      if (!o.length) return;
      if(o.indexOf("=") < 0) return parameters[o] = null;
      var sor = o.split("=");
      var sb = sor.shift();
      var v = sor.join("=");
      if (o.split("=")[1].startsWith("{")) return parameters[sb] = v.substr(1, v.length-2);
      parameters[sb] = formalize(v);
    });
    return [name, parameters, children, i];
  }
  function toJS(v) {
    
  }
  function createElement(type, props, childs) {
    if (!childs) childs = [];
    if (!childs.length && childs.length != 0) childs = [childs];
    props.children = childs;
    return [type, props];
  }
  function xhrParser(script) {
    var elements = []
    var lines = script.split("\n");
    var text = script.split("");
    lines.forEach(e => {
      if (e.startsWith("//")) return;
      var str = false;
      e.split("").forEach((v, i) => {
        var s = script;
        if (v == "\"") str = !str;
        if (v == "<" && !str) elements.push(parseElement(s, i));
      });
    });
    elements.forEach((v, i) => {
      var s = script;
      fixChilds(s, elements, i);
    });
    console.log(elements);
  }
  /*
  loadScripts();
  scripts.forEach(xhrParser);
  */
  JSXE.parseJSX = xhrParser;
  JSXE.parseJSX.toString = _ => "[Hidden Source]";
  JSXE.parseJSX.toSource = _ => "[Hidden Source]";
};
function hide(f) {
  f.toString = f.toSource = _ => "[Hidden Source]";
}
class JSXEComponent {
  constructor(p) {
    this.props = p;
  }
  setState(o) {
    this.state = o;
    JSXE.render();
  }
}
JSXE.render = _ => {
  document.body.innerHTML = "";
  console.log(JSXE.toHTML(JSXE.renderComponent));
  document.body.appendChild(JSXE.toHTML(JSXE.renderComponent));
};
hide(JSXE.render)
JSXE.toHTML = e => {
  if (!e) return;
  var c = document.createElement("div");
  c.innerHTML = e;
  return (e instanceof JSXEComponent) ? JSXE.toHTML(e.render()) : (typeof e === "string" || typeof e === "number") ? c : e;
};
hide(JSXE.toHTML);
JSXE.createElement = (tag, props={}, children=[]) => {
  if (typeof tag !== "string") {
    window[tag.constructor.name] = tag;
    tag = tag.constructor.name;
  }
  if (!Array.isArray(children)) children = [children];
  var c;
  if (!window[tag]) {
    c = document.createElement(tag);
    children.forEach(v => {
      c.appendChild(JSXE.toHTML(v));
    });
    for (var ks of Object.keys(props)) {
      c.setAttribute(ks, props[ks]);
    }
    return c;
  }
  props.children = children;
  if (window[tag].prototype && window[tag].prototype instanceof JSXEComponent) c = new window[tag](props); else { c = new JSXE.Component(props); c.render = _ => {window[tag](this.props)}; }
  return c;
};
hide(JSXE.createElement);
JSXE.Component = JSXEComponent;
(function() {
  var value;
  JSXE.__defineGetter__("renderComponent", _ => value);
  JSXE.__defineSetter__("renderComponent", v => {value = v; JSXE.render()});
})();
class button extends JSXEComponent {
  render() {
    var b = document.createElement("button");
    this.props.children.forEach(v => {
      b.appendChild(JSXE.toHTML(v));
    });
    for (var ks of Object.keys(this.props)) {
      if (ks != "children" && ks != "onclick") b.setAttribute(ks, this.props[ks]);
    }
    b.onclick = this.props.onclick;
    return b;
  }
}