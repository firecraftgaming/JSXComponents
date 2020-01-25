// Copyright Eliyah Sundström ©2020 All rights reserved 
var remove = (str, s, e, r="") => {
  return [str.substring(0, s), str.substring(e)].join(r);
}
var JSXElements = {};
var JSXE = JSXElements;


function hide(f) {
  f.toString = f.toSource = _ => "[Hidden Source]";
}

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
    if (elements[o][1][0].endsWith("/")) {
      elements[o][1][2] = [];
      elements[o][1][4] = getEndOfElement(text, elements[o][1][3])+elements[o][1][3];
      elements[o][1][0] = elements[o][1][0].substr(0, elements[o][1][0].length-1);
      return;
    }
    var level = 0;
    var end = -1;
    for (var i = o; i < elements.length; i++) {
      if (elements[i][1][0] == elements[o][1][0]) level++;
      if (elements[i][1][0] == "/"+elements[o][1][0]) level--;
      if (elements[i][1][0] == "/"+elements[o][1][0] && level == 0) end = i;
    }
    elements[o][1][4] = getEndOfElement(text, elements[end][1][3])+elements[end][1][3];
    var children = elements.splice(o+1, end-o);
    var ende = children.pop();
    var ep = getEndOfElement(text, elements[o][1][3])+elements[o][1][3];
    var tt = text.slice(ep, ende[1][3]);
    var to = tt.length;
    children.forEach((e, i) => children[i][1][3] -= ep);
    children.forEach((e, i) => fixChilds(tt, children, i));
    for (var i = 0; i < children.length; i++) {
      if (typeof children[i] === "string") return;
      var ch = children[i];
      var t = tt.substr(0, ch[1][3]-(to-tt.length));
      tt = remove(tt, 0, ch[1][4]-(to-tt.length));
      if (t != "") children.splice(i, 0, t);
    }
    if (tt != "") children.push(tt);
    var l = 0;
    var s = false;
    for (var i = 0; i < children.length; i++) {
      if (typeof children[i] !== "string") continue;
      for (var j = 0; j < children[i].split("").length; j++) {
        var v = children[i].split("")[j];
        if (v == '"') s = !s;
        if (v == '{') l++;
        if (v == '}') l--;
        if (v == '{' && l < 2) {
          var c = children[i];
          children.splice(i, 1, c.substr(0, j), c.substr(j));
          break;
        }
        if (v == '}' && l < 1) {
          var c = children[i];
          children.splice(i, 1, c.substr(0, j+1), c.substr(j+1));
          break;
        }
      }
    }
    for (var i = 0; i < children.length; i++) {
      if (!children[i+1]) break;
      if (typeof children[i] !== "string") continue
      var l = 0;
      var s = false;
      for (var j = 0; j < children[i].split("").length; j++) {
        var v = children[i].split("")[j];
        if (v == '"') s = !s;
        if (v == '{') l++;
        if (v == '}') l--;
      }
      if (children[i].indexOf("{") > -1 && l > 0) {
        if (typeof children[i+1] !== "string") children[i+1] = toJS(children[i+1]);
        children.splice(i, 2, (children[i]+children[1+1]));
        i--;
      }
    }
    children.forEach(v => {
      if (typeof v !== "string") return elements[o][1][2].push(v);
      if (v.indexOf("{") > -1) return elements[o][1][2].push(["js", v]);
      if (v.replace(/\s/g, '').length) elements[o][1][2].push(["string", v]);
    });
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
      while(str.indexOf("  ") > -1) {
        str = str.replace("  ", " ");
      }
      while(str.indexOf("\n") > -1) {
        str = str.replace("\n", "");
      }
      var str = str.split(" ");
      for (var i = 0; i < str.length; i++) {
        var v = str[i];
        var b = false;
        if (string || string2 || bracks) {

          str.splice(i-1, 2, str[i-1]+" "+v);
          i--;
          continue;
        }
        var bc1 = (v.split('{').length - 1);
        var bc2 = (v.split('}').length - 1);
        if ((v.split('"').length - 1) % 2 > 0) string = !string;
        if ((v.split("'").length - 1) % 2 > 0) string2 = !string2;
        if (bc1 > bc2) bracks = true;
        if (bc1 < bc2) bracks = false;
      }
      return str;
    }
    split(text.substr(start, length)).forEach(v => {
      if (v != "") args.push(v);
    });
    //Args
    var name = args.shift();
    if (!/^[a-z0-9\/]+$/i.test(name)) return false;
    
    var parameters = {};
    var children = [];
    args.forEach(o => {
      if (o.endsWith("/")) {
        name = name+"/";
        o = o.substr(0, o.length-1)
      }
      if (!o.length) return;
      if(o.indexOf("=") < 0) return parameters[o] = true;
      var sor = o.split("=");
      var sb = sor.shift();
      var v = sor.join("=");
      if (!/^[a-z"'`\/]+$/i.test(sb)) return false;
      if (o.split("=")[1].startsWith("{")) return parameters[sb] = v.substr(1, v.length-2);
      parameters[sb] = v;
    });
    return ["jsx", [name, parameters, children, i]];
  }
  function toJS(v) {
    var type = v[0];
    v = v[1];
    if (type == "string") {
      while(v.indexOf("  ") > -1) {
        v = v.replace("  ", " ");
      }
      while(v.indexOf("\n") > -1) {
        v = v.replace("\n", "");
      }
      return '"'+v+'"';
    }
    if (type == "js") {
      while(v.endsWith(" ") || v.endsWith("\n")) {
        v = v.substr(0, v.length-1);
      }
      return v.substr(1, v.length-2);
    }
    if (type != "jsx") return;
    var name = v[0];
    if (name[0] == name[0].toLowerCase()) name = '"'+name+'"';
    var props = [];
    for (var key of Object.keys(v[1])) {
      props.push('"'+key+'": '+v[1][key]);
    }
    props = props.join(", ");
    var childs = [];
    v[2].forEach(o => {
      var r = toJS(o)
      if (r) childs.push(r);
    });

    childs = childs.join(", ");
    return "JSXE.createElement("+name+", {"+props+"}, ["+childs+"])";
  }
  function createElement(type, props, childs) {
    if (!childs) childs = [];
    if (!childs.length && childs.length != 0) childs = [childs];
    props.children = childs;
    return [type, props];
  }
  //Search Pointer For Faster Finding -> #XHR
  function xhrParser(script) {
    var elements = []
    var lines = script.split("\n");
    var text = script.split("");
    var i = 0;
    lines.forEach(e => {
      if (e.startsWith("//")) return e.split("").forEach(_=>i++);
      var str = false;
      e.split("").forEach(v => {
        var s = script;
        if (v == "\"") str = !str;
        if (v == "<" && !str) {
          var ele = parseElement(s, i);
          if (ele) elements.push(ele);
        }
        i++;
      });
      i += 1;
    });
    elements.forEach((v, i) => {
      var s = script;
      fixChilds(s, elements, i);
    });
    elements.reverse().forEach(v => {
      script = remove(script, v[1][3], v[1][4], toJS(v));
    });
    ls.push(script);
  }
  loadScripts();
  var ls = [];
  scripts.forEach(xhrParser);
  ls.forEach(v => {
    var s = document.createElement("script");
    s.text = v;
    document.head.appendChild(s);
  });
  JSXE.parseJSX = xhrParser;
  hide(JSXE.parseJSX);
};
hide(hide);
class JSXEComponent {
  constructor(p) {
    this.props = p;
  }
  setState(o) {
    this.state = o;
    this.HTML.innerHTML = "";
    this.HTML.appendChild(JSXE.toHTML(this.render()));
  }
}
JSXE.render = _ => {
  document.body.innerHTML = "";
  document.body.appendChild(JSXE.toHTML(JSXE.renderComponent));
};
hide(JSXE.render);
JSXE.toHTML = e => {
  if (!e) return;
  var c = document.createElement("div");
  if (e instanceof JSXEComponent) c.appendChild(JSXE.toHTML(e.render())); else if (typeof e === "string" || typeof e === "number") c.innerHTML = e; else c = e;
  if (e instanceof JSXEComponent) c.setAttribute("JSXE", e.constructor.name);
  if (e instanceof JSXEComponent) e.HTML = c;
  return c;
};
hide(JSXE.toHTML);
JSXE.fixDifference = (a, b) => {
  
};
hide(JSXE.fixDifference);
JSXE.isDifferenceObject = (a, b) => {
  if (a.nodeName != b.nodeName) return false;
  
};
hide(JSXE.isDifferenceObject);
JSXE.isDifference = (a, b) => {
  
};
hide(JSXE.isDifference);
JSXE.replace = (a, b) => {
  var i = 0;
  var child = a;
  while( (child = child.previousSibling) != null ) i++;
  a.parentNode.children[i] = b;
};
hide(JSXE.replace);
JSXE.createElement = (tag, props={}, children=[]) => {
  if (typeof tag !== "string") {
    window[tag.constructor.name] = tag;
    tag = tag.constructor.name;
  }
  if (!Array.isArray(children)) children = [children];
  for (var i = 0; i < children.length; i++) {
    if (Array.isArray(children[i])) {
      [].splice.apply(children, [i, 1, ...children[i]]);
      i--;
    }
  }
  var c;
  if (!window[tag]) {
    c = document.createElement(tag);
    children.forEach(v => {
      c.appendChild(JSXE.toHTML(v));
    });
    for (var ks of Object.keys(props)) {
      if (ks.startsWith("on")) {
        c[ks] = props[ks];
      } else {
        c.setAttribute(ks, props[ks]);
      }
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
