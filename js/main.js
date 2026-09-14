(function () {
  var THEMES = ["dark", "light", "unicorn"];
  var THEME_COLORS = { dark: "#0a0c10", light: "#f7f6f2", unicorn: "#ffe4f3" };

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLORS[theme] || THEME_COLORS.unicorn);
  }

  document.getElementById("theme-toggle").addEventListener("click", function () {
    var current = document.documentElement.getAttribute("data-theme");
    var next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
    setTheme(next);
  });

  var THEME_LABELS = { dark: "Dark", light: "Light", unicorn: "Unicorn 🦄" };

  function setTheme(theme) {
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }

  var COMMANDS = THEMES.map(function (theme) {
    return {
      id: "theme-" + theme,
      group: "Theme",
      label: "Theme: " + THEME_LABELS[theme],
      run: function () { setTheme(theme); }
    };
  }).concat([
    { id: "wander", group: "Explore", label: "Wander through the constellation", run: function () { document.dispatchEvent(new CustomEvent("wander:open")); } },
    { id: "go-writing", group: "Go to", label: "Writing", run: function () { window.location.href = "/"; } },
    { id: "go-inspiration", group: "Go to", label: "Inspiration", run: function () { window.location.href = "/inspiration/"; } },
    { id: "go-about", group: "Go to", label: "About", run: function () { window.location.href = "/about/"; } },
    { id: "go-github", group: "Go to", label: "GitHub", run: function () { window.location.href = "https://github.com/chrisgrounds"; } }
  ]);

  var articleLinks = document.querySelectorAll("#command-palette-articles a");
  var articleCommands = Array.prototype.map.call(articleLinks, function (article, index) {
    var url = article.getAttribute("href");
    return {
      id: "article-" + index,
      group: "Article",
      label: article.textContent.trim(),
      run: function () { window.location.href = url; }
    };
  });
  COMMANDS = COMMANDS.concat(articleCommands);

  var dialog = document.getElementById("command-palette");
  var input = document.getElementById("command-palette-input");
  var list = document.getElementById("command-palette-list");
  var activeIndex = 0;
  var visible = COMMANDS;

  function renderCommands() {
    list.innerHTML = "";
    visible.forEach(function (command, index) {
      var item = document.createElement("li");
      item.id = "command-palette-option-" + command.id;
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", index === activeIndex ? "true" : "false");
      item.className = "command-palette__item" + (index === activeIndex ? " is-active" : "");

      var label = document.createElement("span");
      label.textContent = command.label;
      item.appendChild(label);

      var group = document.createElement("span");
      group.className = "command-palette__group";
      group.textContent = command.group;
      item.appendChild(group);

      item.addEventListener("click", function () { runCommand(index); });
      item.addEventListener("mousemove", function () {
        if (activeIndex !== index) setActive(index);
      });

      list.appendChild(item);
    });

    updateActiveDescendant();
  }

  function updateActiveDescendant() {
    if (visible[activeIndex]) {
      input.setAttribute("aria-activedescendant", "command-palette-option-" + visible[activeIndex].id);
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  }

  function setActive(index) {
    var previous = list.children[activeIndex];
    previous.classList.remove("is-active");
    previous.setAttribute("aria-selected", "false");
    activeIndex = index;
    var active = list.children[activeIndex];
    active.classList.add("is-active");
    active.setAttribute("aria-selected", "true");
    updateActiveDescendant();
  }

  function filterCommands(query) {
    var q = query.trim().toLowerCase();
    visible = !q
      ? COMMANDS
      : COMMANDS.filter(function (command) {
          return command.label.toLowerCase().indexOf(q) !== -1 || command.group.toLowerCase().indexOf(q) !== -1;
        });
    activeIndex = 0;
    renderCommands();
  }

  function moveActive(delta) {
    if (!visible.length) return;
    setActive((activeIndex + delta + visible.length) % visible.length);
    list.children[activeIndex].scrollIntoView({ block: "nearest" });
  }

  function runCommand(index) {
    var command = visible[index];
    if (!command) return;
    closePalette();
    command.run();
  }

  function isPaletteOpen() {
    return dialog.open;
  }

  function openPalette() {
    input.value = "";
    filterCommands("");
    dialog.showModal();
    input.focus();
  }

  function closePalette() {
    if (dialog.open) dialog.close();
  }

  document.addEventListener("keydown", function (event) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (isPaletteOpen()) closePalette();
      else openPalette();
    }
  });

  document.getElementById("command-palette-trigger").addEventListener("click", openPalette);

  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });

  input.addEventListener("input", function () {
    filterCommands(input.value);
  });

  input.addEventListener("keydown", function (event) {
    if (event.key === "ArrowDown") { event.preventDefault(); moveActive(1); }
    else if (event.key === "ArrowUp") { event.preventDefault(); moveActive(-1); }
    else if (event.key === "Enter") { event.preventDefault(); runCommand(activeIndex); }
  });

  // A secret: ↑ ↑ ↓ ↓ ← → ← → grows a lambda tree and blooms unicorn mode.
  var KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright"];
  var KONAMI_GLYPHS = { arrowup: "↑", arrowdown: "↓", arrowleft: "←", arrowright: "→" };
  var konamiProgress = 0;
  var konamiResetTimer = null;
  var eggActive = false;

  var konamiOverlay = null;

  // Only renders the keys typed so far — never the keys still to come,
  // so the overlay can't be used to read off the rest of the sequence.
  function updateKonamiOverlay(progress) {
    if (!konamiOverlay) {
      konamiOverlay = document.createElement("div");
      konamiOverlay.className = "konami-progress";
      konamiOverlay.setAttribute("aria-hidden", "true");
      document.body.appendChild(konamiOverlay);
    }
    konamiOverlay.innerHTML = "";
    for (var i = 0; i < progress; i++) {
      var glyph = document.createElement("span");
      glyph.className = "konami-progress__glyph";
      glyph.textContent = KONAMI_GLYPHS[KONAMI[i]] || "?";
      konamiOverlay.appendChild(glyph);
    }
    konamiOverlay.classList.toggle("is-visible", progress > 0);
  }

  document.addEventListener("keydown", function (event) {
    if (isPaletteOpen()) return;
    var active = document.activeElement;
    if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable)) return;

    var key = event.key.toLowerCase();
    var nextProgress = key === KONAMI[konamiProgress] ? konamiProgress + 1 : (key === KONAMI[0] ? 1 : 0);
    if (nextProgress !== konamiProgress) {
      konamiProgress = nextProgress;
      updateKonamiOverlay(konamiProgress);
    }

    clearTimeout(konamiResetTimer);
    if (konamiProgress > 0) {
      konamiResetTimer = setTimeout(function () {
        konamiProgress = 0;
        updateKonamiOverlay(0);
      }, 1200);
    }

    if (konamiProgress === KONAMI.length) {
      konamiProgress = 0;
      updateKonamiOverlay(0);
      triggerEasterEgg();
    }
  });

  function triggerEasterEgg() {
    if (eggActive) return;
    eggActive = true;
    setTheme("unicorn");
    showToast("🦄 the λ-tree blooms");

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) { eggActive = false; return; }
    growLambdaTree(function () { eggActive = false; });
  }

  function showToast(text) {
    var toast = document.createElement("div");
    toast.className = "easter-egg-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.textContent = text;
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { toast.classList.add("is-visible"); });
    });

    setTimeout(function () {
      toast.classList.remove("is-visible");
      setTimeout(function () { toast.remove(); }, 350);
    }, 2400);
  }

  // Same fractal all day (seeded by today's date), a new one tomorrow.
  function growLambdaTree(onDone) {
    var canvas = document.createElement("canvas");
    canvas.className = "easter-egg-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    function resize() {
      var dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      needsRedraw = true;
    }
    resize();
    window.addEventListener("resize", resize);

    var now = new Date();
    var startOfYear = new Date(now.getFullYear(), 0, 0);
    var dayOfYear = Math.floor((now - startOfYear) / 86400000);
    var seed = now.getFullYear() * 1000 + dayOfYear;

    function nodeRandom(pathSeed) {
      var x = Math.imul(pathSeed ^ seed, 2654435761);
      x = (x ^ (x >>> 15)) >>> 0;
      return x / 4294967296;
    }

    var COLORS = ["#ff5da2", "#ffd166", "#6ee7b7", "#60a5fa", "#a78bfa"];
    var colorOffset = seed % COLORS.length;
    var spread = 0.5 + nodeRandom(1) * 0.5;
    var maxDepth = 9;

    function drawBranch(x, y, len, angle, depth, pathSeed) {
      if (len < 4 || depth <= 0) return;
      var x2 = x + Math.cos(angle) * len;
      var y2 = y - Math.sin(angle) * len;

      ctx.strokeStyle = COLORS[(colorOffset + (maxDepth - depth)) % COLORS.length];
      ctx.lineWidth = Math.max(1, depth * 0.6);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      if (depth === 1) {
        ctx.fillStyle = COLORS[(colorOffset + 2) % COLORS.length];
        ctx.font = Math.max(10, len) + "px Georgia, serif";
        ctx.fillText("λ", x2 - 4, y2 + 4);
        return;
      }

      var varianceL = (nodeRandom(pathSeed * 2 + 1) - 0.5) * spread;
      var varianceR = (nodeRandom(pathSeed * 2 + 2) - 0.5) * spread;
      drawBranch(x2, y2, len * 0.72, angle - 0.42 + varianceL, depth - 1, pathSeed * 2 + 1);
      drawBranch(x2, y2, len * 0.72, angle + 0.42 + varianceR, depth - 1, pathSeed * 2 + 2);
    }

    var startedAt = null;
    var drawnDepth = 0;
    var needsRedraw = true;
    var STEP_MS = 130;
    var HOLD_MS = 1600;
    var FADE_MS = 700;

    function drawTree(depth) {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      drawBranch(window.innerWidth / 2, window.innerHeight * 0.86, window.innerHeight * 0.16, Math.PI / 2, depth, 1);
    }

    function frame(ts) {
      if (startedAt === null) startedAt = ts;
      var elapsed = ts - startedAt;
      var depth = Math.min(maxDepth, 1 + Math.floor(elapsed / STEP_MS));
      if (needsRedraw || depth !== drawnDepth) {
        drawTree(depth);
        drawnDepth = depth;
        needsRedraw = false;
      }
      if (elapsed < (maxDepth - 1) * STEP_MS + HOLD_MS) {
        requestAnimationFrame(frame);
        return;
      }

      canvas.classList.add("is-fading");
      setTimeout(function () {
        window.removeEventListener("resize", resize);
        canvas.remove();
        if (onDone) onDone();
      }, FADE_MS);
    }

    requestAnimationFrame(frame);
  }
})();
