(function () {
  var THEMES = ["dark", "light"];
  var THEME_COLORS = { dark: "#0a0c10", light: "#f7f6f2" };

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLORS[theme] || THEME_COLORS.light);
  }

  document.getElementById("theme-toggle").addEventListener("click", function () {
    var current = document.documentElement.getAttribute("data-theme");
    var next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
    setTheme(next);
  });

  var THEME_LABELS = { dark: "Dark", light: "Light" };

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
      item.className = "command-palette__item flex-between" + (index === activeIndex ? " is-active" : "");

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
})();
