(function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";
  var dialog;
  var map;
  var statusTitle;
  var statusDetails;
  var statusRelation;
  var openLink;
  var posts = [];
  var edges = [];
  var nodeElements = [];
  var edgeElements = [];
  var trailElement;
  var selectedIndex = -1;
  var trail = [];
  var rendered = false;

  function svgElement(name, attributes) {
    var element = document.createElementNS(SVG_NS, name);
    Object.keys(attributes || {}).forEach(function (key) {
      element.setAttribute(key, attributes[key]);
    });
    return element;
  }

  function hash(text) {
    var value = 2166136261;
    for (var i = 0; i < text.length; i++) {
      value ^= text.charCodeAt(i);
      value = Math.imul(value, 16777619);
    }
    return value >>> 0;
  }

  function sharedTags(left, right) {
    return left.tags.filter(function (tag) {
      return right.tags.indexOf(tag) !== -1;
    });
  }

  function readPosts() {
    var links = document.querySelectorAll("#command-palette-articles a");
    posts = Array.prototype.map.call(links, function (link, index) {
      var tags = (link.dataset.wanderTags || "")
        .split("|")
        .map(function (tag) { return tag.trim(); })
        .filter(Boolean);
      var seed = hash(link.textContent.trim());
      var angle = index * 2.399963229728653 + (seed % 100) / 100;
      var radius = 75 + Math.sqrt(index + 1) * 42;
      return {
        title: link.textContent.trim(),
        url: link.getAttribute("href"),
        date: link.dataset.wanderDate || "",
        tags: tags,
        x: 500 + Math.cos(angle) * radius,
        y: 310 + Math.sin(angle) * radius,
        degree: 0
      };
    });
  }

  function connectPosts() {
    edges = [];
    posts.forEach(function (post) { post.degree = 0; });
    for (var i = 0; i < posts.length; i++) {
      for (var j = i + 1; j < posts.length; j++) {
        var tags = sharedTags(posts[i], posts[j]);
        if (!tags.length) continue;
        var weight = tags.length;
        edges.push({ from: i, to: j, weight: weight });
        posts[i].degree += weight;
        posts[j].degree += weight;
      }
    }
  }

  function arrangePosts() {
    var iterations = 240;
    for (var step = 0; step < iterations; step++) {
      var movement = posts.map(function () { return { x: 0, y: 0 }; });

      for (var i = 0; i < posts.length; i++) {
        for (var j = i + 1; j < posts.length; j++) {
          var dx = posts[j].x - posts[i].x;
          var dy = posts[j].y - posts[i].y;
          var distanceSquared = Math.max(dx * dx + dy * dy, 100);
          var distance = Math.sqrt(distanceSquared);
          var repulsion = 1500 / distanceSquared;
          var pushX = dx / distance * repulsion;
          var pushY = dy / distance * repulsion;
          movement[i].x -= pushX;
          movement[i].y -= pushY;
          movement[j].x += pushX;
          movement[j].y += pushY;
        }
      }

      edges.forEach(function (edge) {
        var left = posts[edge.from];
        var right = posts[edge.to];
        var dx = right.x - left.x;
        var dy = right.y - left.y;
        var distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        var desired = 155 - Math.min(edge.weight, 3) * 18;
        var pull = (distance - desired) * 0.012 * Math.min(edge.weight, 2);
        var pullX = dx / distance * pull;
        var pullY = dy / distance * pull;
        movement[edge.from].x += pullX;
        movement[edge.from].y += pullY;
        movement[edge.to].x -= pullX;
        movement[edge.to].y -= pullY;
      });

      posts.forEach(function (post, index) {
        movement[index].x += (500 - post.x) * 0.0025;
        movement[index].y += (310 - post.y) * 0.0025;
        post.x += movement[index].x;
        post.y += movement[index].y;
      });
    }

    var xs = posts.map(function (post) { return post.x; });
    var ys = posts.map(function (post) { return post.y; });
    var minX = Math.min.apply(Math, xs);
    var maxX = Math.max.apply(Math, xs);
    var minY = Math.min.apply(Math, ys);
    var maxY = Math.max.apply(Math, ys);
    posts.forEach(function (post) {
      post.x = 75 + (post.x - minX) / Math.max(maxX - minX, 1) * 850;
      post.y = 60 + (post.y - minY) / Math.max(maxY - minY, 1) * 500;
      post.radius = 7 + Math.min(8, Math.sqrt(post.degree) * 2.2);
    });
  }

  function addGradient(defs) {
    var gradient = svgElement("linearGradient", {
      id: "wander-unicorn-gradient",
      x1: "0%",
      y1: "0%",
      x2: "100%",
      y2: "100%"
    });
    [
      ["0%", "#d99ab3"],
      ["25%", "#dbc08a"],
      ["50%", "#9fcbb7"],
      ["75%", "#91b7d2"],
      ["100%", "#b09bc9"]
    ].forEach(function (stop) {
      gradient.appendChild(svgElement("stop", { offset: stop[0], "stop-color": stop[1] }));
    });
    defs.appendChild(gradient);
  }

  function renderMap() {
    map.innerHTML = "";
    var defs = svgElement("defs");
    addGradient(defs);
    map.appendChild(defs);

    var edgeLayer = svgElement("g", { class: "wander__edges", "aria-hidden": "true" });
    edgeElements = edges.map(function (edge) {
      var line = svgElement("line", {
        class: "wander__edge",
        x1: posts[edge.from].x,
        y1: posts[edge.from].y,
        x2: posts[edge.to].x,
        y2: posts[edge.to].y
      });
      edgeLayer.appendChild(line);
      return line;
    });
    map.appendChild(edgeLayer);

    trailElement = svgElement("polyline", {
      class: "wander__trail",
      points: "",
      "aria-hidden": "true"
    });
    map.appendChild(trailElement);

    var nodeLayer = svgElement("g", { class: "wander__nodes" });
    nodeElements = posts.map(function (post, index) {
      var node = svgElement("g", {
        class: "wander__node",
        role: "link",
        tabindex: "-1",
        transform: "translate(" + post.x + " " + post.y + ")",
        "aria-label": post.title + (post.tags.length ? ". Tags: " + post.tags.join(", ") : "")
      });
      node.appendChild(svgElement("circle", { r: post.radius }));
      var label = svgElement("text", {
        class: "wander__node-label",
        x: post.x > 760 ? -post.radius - 7 : post.radius + 7,
        y: "4"
      });
      if (post.x > 760) label.setAttribute("text-anchor", "end");
      label.textContent = post.title.length > 42 ? post.title.slice(0, 39) + "…" : post.title;
      node.appendChild(label);
      node.addEventListener("click", function () { selectPost(index, true); });
      node.addEventListener("dblclick", function () { window.location.href = post.url; });
      nodeLayer.appendChild(node);
      return node;
    });
    map.appendChild(nodeLayer);
    rendered = true;
  }

  function formatDate(value) {
    if (!value) return "Undated";
    var date = new Date(value + "T00:00:00");
    return isNaN(date.getTime())
      ? value
      : date.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
  }

  function relationText(previous, current) {
    if (previous < 0 || previous === current) return "Start anywhere. Follow what glows.";
    var tags = sharedTags(posts[previous], posts[current]);
    return tags.length
      ? "Connected by " + tags.join(", ") + "."
      : "A leap into a different corner of the map.";
  }

  function updateStatus(previous) {
    var post = posts[selectedIndex];
    statusTitle.textContent = post.title;
    statusDetails.textContent = formatDate(post.date) + (post.tags.length ? " · " + post.tags.join(" · ") : "");
    statusRelation.textContent = relationText(previous, selectedIndex);
    openLink.setAttribute("href", post.url);
  }

  function updateTrail() {
    trailElement.setAttribute("points", trail.map(function (index) {
      return posts[index].x + "," + posts[index].y;
    }).join(" "));

    edgeElements.forEach(function (element, edgeIndex) {
      var edge = edges[edgeIndex];
      var active = edge.from === selectedIndex || edge.to === selectedIndex;
      element.classList.toggle("is-active", active);
      element.classList.toggle("is-travelled", trail.some(function (index, position) {
        if (!position) return false;
        var previous = trail[position - 1];
        return (edge.from === previous && edge.to === index) || (edge.to === previous && edge.from === index);
      }));
    });
  }

  function selectPost(index, moveFocus) {
    if (index < 0 || index >= posts.length) return;
    var previous = selectedIndex;
    selectedIndex = index;
    if (trail[trail.length - 1] !== index) trail.push(index);

    nodeElements.forEach(function (element, nodeIndex) {
      var selected = nodeIndex === selectedIndex;
      element.classList.toggle("is-selected", selected);
      element.classList.toggle("is-visited", trail.indexOf(nodeIndex) !== -1);
      element.setAttribute("tabindex", selected ? "0" : "-1");
    });
    updateTrail();
    updateStatus(previous);

    if (moveFocus) {
      nodeElements[index].focus({ preventScroll: true });
    }
  }

  function closestInDirection(directionX, directionY) {
    var current = posts[selectedIndex];
    var bestIndex = -1;
    var bestScore = -Infinity;
    posts.forEach(function (post, index) {
      if (index === selectedIndex) return;
      var dx = post.x - current.x;
      var dy = post.y - current.y;
      var distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      var alignment = (dx / distance) * directionX + (dy / distance) * directionY;
      if (alignment < 0.2) return;
      var connected = sharedTags(current, post).length > 0 ? 0.35 : 0;
      var score = alignment * 2 + connected - distance / 900;
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });
    return bestIndex;
  }

  function openWander() {
    if (!dialog || !posts.length) return;
    if (!rendered) {
      connectPosts();
      arrangePosts();
      renderMap();
    }
    trail = [];
    selectedIndex = -1;
    var startingIndex = posts.reduce(function (best, post, index) {
      return best < 0 || post.degree > posts[best].degree ? index : best;
    }, -1);
    dialog.showModal();
    selectPost(startingIndex, false);
    requestAnimationFrame(function () { nodeElements[startingIndex].focus({ preventScroll: true }); });
  }

  function closeWander() {
    if (dialog && dialog.open) dialog.close();
  }

  function handleKeys(event) {
    if (!dialog.open) return;
    var direction = null;
    if (event.key === "ArrowLeft") direction = [-1, 0];
    if (event.key === "ArrowRight") direction = [1, 0];
    if (event.key === "ArrowUp") direction = [0, -1];
    if (event.key === "ArrowDown") direction = [0, 1];
    if (direction) {
      event.preventDefault();
      var next = closestInDirection(direction[0], direction[1]);
      if (next >= 0) selectPost(next, true);
      return;
    }
    if (event.key === "Enter" && event.target.closest(".wander__node")) {
      event.preventDefault();
      window.location.href = posts[selectedIndex].url;
    }
  }

  function initialise() {
    dialog = document.getElementById("wander-dialog");
    map = document.getElementById("wander-map");
    statusTitle = document.getElementById("wander-status-title");
    statusDetails = document.getElementById("wander-status-details");
    statusRelation = document.getElementById("wander-status-relation");
    openLink = document.getElementById("wander-open");
    if (!dialog || !map || !statusTitle || !statusDetails || !statusRelation || !openLink) return;
    readPosts();
    document.addEventListener("wander:open", openWander);
    document.getElementById("wander-close").addEventListener("click", closeWander);
    dialog.addEventListener("keydown", handleKeys);
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) closeWander();
    });
    dialog.addEventListener("close", function () {
      var trigger = document.getElementById("command-palette-trigger");
      if (trigger) trigger.focus();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialise);
  else initialise();
})();
