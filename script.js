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
  function fixTextChilds(text, elements, o) {

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
    children.pop();
    elements[o][2].push.apply(elements[o][2], children);
  }
  function getEndOfElement(text, o) {
    var string = false;
    var bracks = false;
    var c = 1;
    for (var i = o+1; i < text.length; i++) {
      c++;
      if (text[i] == "\"") string = !string;
      if (text[i] == "{") bracks = true;
      if (text[i] == "}") bracks = false;
      if (text[i] == ">" && !bracks && !string) return c;
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
    text.substr(start, length).split(" ").forEach(v => {
      if (v != "") args.push(v);
    });
    //Args
    var name = args.shift();
    var parameters = {};
    var children = [];
    args.forEach(o => {
      if (o.length) parameters[o.split("=")[0]] = formalize(o.split("=")[1]);
    });
    return [name, parameters, children, i];
  }
  function createElement(type, props, childs) {
    if (!childs) childs = [];
    if (!childs.length && childs.length != 0) childs = [childs];
    props.children = childs;
    return [type, props];
  }
  function xhrParser(script) {
    var elements = [];
    var text = script.split("");
    text.forEach((v, i) => {
      var s = script;
      if (v == "<") elements.push(parseElement(s, i));
    });
    elements.forEach((v, i) => {
      var s = script;
      fixChilds(s, elements, i);
    });
    elements.forEach((v, i) => {
      var s = script;
      fixTextChilds(s, elements, i);
    });
    console.log(elements);
  }
  loadScripts();
  scripts.forEach(xhrParser);
};