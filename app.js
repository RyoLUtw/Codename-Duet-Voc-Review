(() => {
  "use strict";

  const WORD_POOL = [
    "achieve", "adventure", "advice", "airport", "amount", "ancient", "apartment", "appointment",
    "argument", "arrange", "article", "attention", "average", "balance", "behavior", "borrow",
    "breathe", "bridge", "calendar", "career", "celebrate", "challenge", "choice", "climate",
    "comfortable", "communicate", "community", "compare", "complain", "complete", "concert", "connect",
    "consider", "contact", "continue", "conversation", "crowded", "culture", "customer", "decision",
    "deliver", "describe", "develop", "direction", "discover", "education", "electricity", "embarrassed",
    "encourage", "environment", "especially", "exercise", "experience", "festival", "foreign", "future",
    "generous", "government", "habit", "healthy", "improve", "include", "independent", "information",
    "instead", "interview", "journey", "knowledge", "language", "local", "manage", "material",
    "medicine", "memory", "message", "natural", "necessary", "neighbor", "opinion", "ordinary",
    "organize", "patient", "performance", "possible", "prepare", "promise", "protect", "public",
    "receive", "recommend", "relationship", "repair", "responsible", "schedule", "similar", "solution",
    "suggest", "tradition", "transportation", "volunteer"
  ];

  const dom = {
    setupView: document.querySelector("#setup-view"),
    gameView: document.querySelector("#game-view"),
    setupForm: document.querySelector("#setup-form"),
    vocabInput: document.querySelector("#vocab-input"),
    vocabFile: document.querySelector("#vocab-file"),
    wordCount: document.querySelector("#word-count"),
    deviceModes: document.querySelectorAll("input[name='device-mode']"),
    timerCount: document.querySelector("#timer-count"),
    firstGiver: document.querySelector("#first-giver"),
    board: document.querySelector("#board"),
    boardSource: document.querySelector("#board-source"),
    turnHeading: document.querySelector("#turn-heading"),
    turnGuidance: document.querySelector("#turn-guidance"),
    phasePill: document.querySelector("#phase-pill"),
    agentsFound: document.querySelector("#agents-found"),
    tokensLeft: document.querySelector("#tokens-left"),
    customUsed: document.querySelector("#custom-used"),
    clueForm: document.querySelector("#clue-form"),
    clueWord: document.querySelector("#clue-word"),
    clueNumber: document.querySelector("#clue-number"),
    guessActions: document.querySelector("#guess-actions"),
    activeClue: document.querySelector("#active-clue"),
    endTurn: document.querySelector("#end-turn"),
    suddenControls: document.querySelector("#sudden-controls"),
    suddenGuesser: document.querySelector("#sudden-guesser"),
    missionLog: document.querySelector("#mission-log"),
    resultBanner: document.querySelector("#result-banner"),
    resultMessage: document.querySelector("#result-message"),
    confirmBystander: document.querySelector("#confirm-bystander"),
    multiDeviceKeys: document.querySelector("#multi-device-keys"),
    qrA: document.querySelector("#qr-a"),
    qrB: document.querySelector("#qr-b"),
    qrLinkA: document.querySelector("#qr-link-a"),
    qrLinkB: document.querySelector("#qr-link-b"),
    keyDialog: document.querySelector("#key-dialog"),
    keyAlignStep: document.querySelector("#key-align-step"),
    keyRevealStep: document.querySelector("#key-reveal-step"),
    keyGridA: document.querySelector("#key-grid-a"),
    keyGridB: document.querySelector("#key-grid-b"),
    rulesDialog: document.querySelector("#rules-dialog"),
    masthead: document.querySelector(".masthead"),
    shell: document.querySelector(".shell"),
    phoneKeyView: document.querySelector("#phone-key-view"),
    phoneKeyTitle: document.querySelector("#phone-key-title"),
    phoneKeyGrid: document.querySelector("#phone-key-grid")
  };

  let state = null;

  function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
    }
    return copy;
  }

  function uniqueEntries(text) {
    const entries = text
      .split(/[\n,;\t]+/)
      .map((entry) => entry.replace(/^["']|["']$/g, "").trim())
      .filter(Boolean);
    const found = new Set();
    return entries.filter((entry) => {
      const key = entry.toLocaleLowerCase();
      if (found.has(key)) {
        return false;
      }
      found.add(key);
      return true;
    });
  }

  function updateCustomCount() {
    const count = uniqueEntries(dom.vocabInput.value).length;
    if (!count) {
      dom.wordCount.textContent = "No custom entries yet. The learning pool will supply all 25 words.";
      return;
    }
    const fill = Math.max(25 - count, 0);
    const detail = fill ? `${fill} pool word${fill === 1 ? "" : "s"} will be added.` : "25 entries will be selected.";
    dom.wordCount.textContent = `${count} unique custom entr${count === 1 ? "y" : "ies"} found. ${detail}`;
  }

  function createKey() {
    const spots = shuffle(Array.from({ length: 25 }, (_, index) => index));
    const sideA = Array(25).fill("bystander");
    const sideB = Array(25).fill("bystander");

    spots.slice(0, 3).forEach((index) => {
      sideA[index] = "agent";
      sideB[index] = "agent";
    });
    spots.slice(3, 9).forEach((index) => {
      sideA[index] = "agent";
    });
    spots.slice(9, 15).forEach((index) => {
      sideB[index] = "agent";
    });

    sideB[spots[3]] = "assassin";
    sideA[spots[9]] = "assassin";
    sideA[spots[15]] = "assassin";
    sideB[spots[15]] = "assassin";
    sideA[spots[16]] = "assassin";
    sideB[spots[17]] = "assassin";

    return { A: sideA, B: sideB };
  }

  function otherSide(side) {
    return side === "A" ? "B" : "A";
  }

  function selectedDeviceMode() {
    const selected = [...dom.deviceModes].find((input) => input.checked);
    return selected ? selected.value : "one";
  }

  function buildMission(customEntries) {
    const selectedCustom = shuffle(customEntries).slice(0, 25);
    const customKeys = new Set(selectedCustom.map((word) => word.toLocaleLowerCase()));
    const fillers = shuffle(WORD_POOL.filter((word) => !customKeys.has(word.toLocaleLowerCase())))
      .slice(0, 25 - selectedCustom.length);
    const board = shuffle([...selectedCustom, ...fillers]);
    const timerLimit = Number(dom.timerCount.value);

    state = {
      board,
      customCount: selectedCustom.length,
      poolCount: fillers.length,
      keys: createKey(),
      contacted: new Set(),
      bystanders: {
        A: new Set(),
        B: new Set()
      },
      revealedAssassin: null,
      clueGiver: dom.firstGiver.value,
      tokens: timerLimit,
      timerLimit,
      phase: "clue",
      clue: null,
      hasGuessed: false,
      pendingBystander: null,
      deviceMode: selectedDeviceMode(),
      log: []
    };
  }

  function bytesToBase64Url(bytes) {
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function base64UrlToBytes(text) {
    const base64 = text.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(text.length / 4) * 4, "=");
    return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  }

  function encodeKeyPayload(payload) {
    return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  }

  function decodeKeyPayload(text) {
    return JSON.parse(new TextDecoder().decode(base64UrlToBytes(text)));
  }

  function roleCode(role) {
    if (role === "agent") {
      return "c";
    }
    if (role === "assassin") {
      return "a";
    }
    return "b";
  }

  function roleFromCode(code) {
    if (code === "c") {
      return "agent";
    }
    if (code === "a") {
      return "assassin";
    }
    return "bystander";
  }

  function phoneKeyUrl(side) {
    const payload = {
      side,
      words: state.board,
      roles: state.keys[side].map(roleCode).join("")
    };
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    if (url.pathname.endsWith("/")) {
      url.pathname = `${url.pathname}index.html`;
    }
    url.searchParams.set("key", encodeKeyPayload(payload));
    return url.toString();
  }

  function renderQrCode(container, url) {
    if (typeof qrcode !== "function") {
      container.textContent = "QR library unavailable";
      return;
    }
    try {
      const qr = qrcode(0, "L");
      qr.addData(url);
      qr.make();
      container.innerHTML = qr.createSvgTag({
        cellSize: 4,
        margin: 3,
        scalable: true
      });
    } catch (error) {
      container.textContent = "Key URL is too long for a QR code. Shorten long vocabulary entries or use the link below.";
    }
  }

  function renderMultiDeviceKeys() {
    if (!state || state.deviceMode !== "multi") {
      dom.multiDeviceKeys.classList.add("hidden");
      return;
    }
    const sideAUrl = phoneKeyUrl("A");
    const sideBUrl = phoneKeyUrl("B");
    renderQrCode(dom.qrA, sideAUrl);
    renderQrCode(dom.qrB, sideBUrl);
    dom.qrLinkA.href = sideAUrl;
    dom.qrLinkB.href = sideBUrl;
    dom.qrLinkA.textContent = "Open Side A key";
    dom.qrLinkB.textContent = "Open Side B key";
    dom.multiDeviceKeys.classList.remove("hidden");
  }

  function logEvent(text) {
    state.log.unshift(text);
    state.log = state.log.slice(0, 8);
  }

  function showBanner(text, type = "", confirmable = false) {
    dom.resultMessage.textContent = text;
    dom.resultBanner.className = `result-banner ${type}`.trim();
    dom.confirmBystander.classList.toggle("hidden", !confirmable);
    dom.confirmBystander.disabled = !confirmable;
  }

  function hideBanner() {
    dom.resultBanner.className = "result-banner hidden";
    dom.resultMessage.textContent = "";
    dom.confirmBystander.classList.add("hidden");
    dom.confirmBystander.disabled = true;
  }

  function renderBoard() {
    const visibleBystanders = state.bystanders[state.clueGiver] || new Set();
    dom.board.innerHTML = "";
    state.board.forEach((word, index) => {
      const card = document.createElement("button");
      const classes = ["word-card"];
      if (state.contacted.has(index)) {
        classes.push("contacted");
      } else if (state.revealedAssassin === index) {
        classes.push("revealed-assassin");
      } else if (visibleBystanders.has(index)) {
        classes.push("seen-bystander");
      }
      card.className = classes.join(" ");
      card.type = "button";
      card.dataset.index = String(index);
      card.setAttribute("aria-label", word);
      card.disabled = Boolean(state.pendingBystander) || state.contacted.has(index) || ["clue", "won", "lost"].includes(state.phase);
      card.textContent = word;

      if (state.contacted.has(index)) {
        const mark = document.createElement("small");
        mark.textContent = "contacted";
        card.append(mark);
      } else if (state.revealedAssassin === index) {
        const mark = document.createElement("small");
        mark.textContent = "assassin";
        card.append(mark);
      } else if (visibleBystanders.has(index)) {
        const mark = document.createElement("small");
        mark.textContent = "Bystander";
        card.append(mark);
      }
      card.addEventListener("click", () => makeGuess(index));
      dom.board.append(card);
    });
  }

  function renderLog() {
    dom.missionLog.innerHTML = "";
    state.log.forEach((event) => {
      const item = document.createElement("li");
      item.textContent = event;
      dom.missionLog.append(item);
    });
  }

  function render() {
    const guesser = otherSide(state.clueGiver);
    const normalGuess = state.phase === "guess";
    const over = state.phase === "won" || state.phase === "lost";
    dom.agentsFound.textContent = String(state.contacted.size);
    dom.tokensLeft.textContent = String(state.tokens);
    dom.customUsed.textContent = String(state.customCount);
    dom.boardSource.textContent = `${state.customCount} custom word${state.customCount === 1 ? "" : "s"} and ${state.poolCount} learning-pool word${state.poolCount === 1 ? "" : "s"} on this board.`;
    dom.clueForm.classList.toggle("hidden", state.phase !== "clue");
    dom.guessActions.classList.toggle("hidden", !normalGuess);
    dom.suddenControls.classList.toggle("hidden", state.phase !== "sudden");
    document.querySelector(".key-actions").classList.toggle("hidden", state.deviceMode === "multi");
    renderMultiDeviceKeys();

    if (state.phase === "clue") {
      dom.turnHeading.textContent = `Side ${state.clueGiver} gives a clue`;
      dom.turnGuidance.textContent = "Reveal the separated shared keys when players need their private information.";
      dom.phasePill.textContent = "Clue";
    } else if (normalGuess) {
      dom.turnHeading.textContent = `Side ${guesser} guesses`;
      dom.turnGuidance.textContent = "Select words on the board, or end the turn after at least one guess.";
      dom.phasePill.textContent = "Guess";
      dom.activeClue.textContent = state.clue.label;
      dom.endTurn.disabled = !state.hasGuessed || Boolean(state.pendingBystander);
    } else if (state.phase === "sudden") {
      dom.turnHeading.textContent = "Sudden death";
      dom.turnGuidance.textContent = "No clues remain. A single bystander or assassin guess ends the mission.";
      dom.phasePill.textContent = "Sudden death";
    } else {
      dom.turnHeading.textContent = state.phase === "won" ? "Mission complete" : "Mission failed";
      dom.turnGuidance.textContent = state.phase === "won"
        ? "All 15 agents were contacted."
        : "Start a new mission to try again.";
      dom.phasePill.textContent = state.phase === "won" ? "Success" : "Game over";
    }
    dom.endTurn.disabled = !state.hasGuessed || !normalGuess || Boolean(state.pendingBystander);
    if (over) {
      dom.keyDialog.close();
    }
    renderBoard();
    renderLog();
  }

  function beginMission(event) {
    event.preventDefault();
    buildMission(uniqueEntries(dom.vocabInput.value));
    hideBanner();
    dom.setupView.classList.add("hidden");
    dom.gameView.classList.remove("hidden");
    dom.clueWord.value = "";
    dom.clueNumber.value = "";
    state.pendingBystander = null;
    render();
  }

  function beginGuessing(event) {
    event.preventDefault();
    if (!state || state.phase !== "clue") {
      return;
    }
    state.clue = {
      word: dom.clueWord.value.trim(),
      number: dom.clueNumber.value.trim(),
      label: clueLabel(dom.clueWord.value.trim(), dom.clueNumber.value.trim())
    };
    state.phase = "guess";
    state.hasGuessed = false;
    logEvent(`Side ${state.clueGiver}: ${state.clue.label}`);
    render();
  }

  function spendTurn(reason) {
    state.tokens -= 1;
    if (reason) {
      logEvent(reason);
    }
    if (state.tokens === 0) {
      state.phase = "sudden";
      showBanner("The timer is empty. Sudden death begins.");
      return;
    }
    state.clueGiver = otherSide(state.clueGiver);
    state.phase = "clue";
    state.clue = null;
    state.hasGuessed = false;
    dom.clueWord.value = "";
    dom.clueNumber.value = "";
  }

  function succeed() {
    state.phase = "won";
    logEvent("All 15 agents contacted.");
    showBanner("Mission complete: all 15 agents contacted.");
  }

  function fail(text, revealedAssassin = null) {
    if (revealedAssassin !== null) {
      state.revealedAssassin = revealedAssassin;
    }
    state.phase = "lost";
    logEvent(text);
    showBanner(text, "loss");
  }

  function clueLabel(word, number) {
    if (word && number) {
      return `Clue: ${word} - ${number}`;
    }
    if (word) {
      return `Clue: ${word}`;
    }
    if (number) {
      return `Clue number: ${number}`;
    }
    return "No clue entered";
  }

  function makeGuess(index) {
    if (!state || state.pendingBystander || !["guess", "sudden"].includes(state.phase)) {
      return;
    }
    const sudden = state.phase === "sudden";
    const guesser = sudden ? dom.suddenGuesser.value : otherSide(state.clueGiver);
    const reader = sudden ? otherSide(guesser) : state.clueGiver;
    if (state.contacted.has(index)) {
      return;
    }
    const result = state.keys[reader][index];
    const word = state.board[index];
    state.hasGuessed = true;

    if (result === "agent") {
      state.contacted.add(index);
      logEvent(`${word}: agent contacted.`);
      if (state.contacted.size === 15) {
        succeed();
      }
    } else if (result === "assassin") {
      fail(`${word} was an assassin. Mission failed.`, index);
    } else if (sudden) {
      fail(`${word} was not an agent in sudden death. Mission failed.`);
    } else {
      state.bystanders[reader].add(index);
      const nextClueGiver = otherSide(reader);
      state.pendingBystander = {
        index,
        word,
        nextClueGiver,
        logText: `${word}: bystander. Turn ended.`
      };
      showBanner(`${word} is a bystander. Guessing ends. Side ${nextClueGiver} gives clue now.`, "bystander", true);
    }
    render();
  }

  function confirmBystander() {
    if (!state || !state.pendingBystander) {
      return;
    }
    const pending = state.pendingBystander;
    state.pendingBystander = null;
    hideBanner();
    spendTurn(pending.logText);
    render();
  }

  function endTurn() {
    if (state.phase !== "guess" || !state.hasGuessed) {
      return;
    }
    spendTurn("Guessing stopped. Turn ended.");
    render();
  }

  function renderKeyGrid(grid, side) {
    grid.innerHTML = "";
    state.board.forEach((word, index) => {
      const result = state.keys[side][index];
      const cell = document.createElement("div");
      cell.className = `key-cell ${result}`;
      const label = document.createElement("span");
      label.className = "key-label";
      label.textContent = word;
      cell.append(label);
      grid.append(cell);
    });
    fitKeyLabels(grid);
  }

  function fitKeyLabels(root) {
    requestAnimationFrame(() => {
      root.querySelectorAll(".key-label").forEach((label) => {
        const cell = label.closest(".key-cell");
        let size = Number.parseFloat(getComputedStyle(cell).fontSize);
        const minimum = 4.5;
        label.style.fontSize = `${size}px`;
        label.style.lineHeight = "1.06";
        while (
          size > minimum &&
          (label.scrollWidth > cell.clientWidth - 6 || label.scrollHeight > cell.clientHeight - 6)
        ) {
          size -= 0.5;
          label.style.fontSize = `${size}px`;
        }
      });
    });
  }

  function refitVisibleKeyLabels() {
    [dom.keyGridA, dom.keyGridB, dom.phoneKeyGrid].forEach((grid) => {
      if (grid && grid.querySelector(".key-label")) {
        fitKeyLabels(grid);
      }
    });
  }

  function renderPhoneKey(payload) {
    dom.masthead.classList.add("hidden");
    dom.shell.classList.add("hidden");
    dom.resultBanner.classList.add("hidden");
    dom.phoneKeyView.classList.remove("hidden");
    dom.phoneKeyTitle.textContent = `Side ${payload.side} key`;
    dom.phoneKeyGrid.innerHTML = "";
    payload.words.forEach((word, index) => {
      const role = roleFromCode(payload.roles[index]);
      const cell = document.createElement("div");
      cell.className = `key-cell ${role}`;
      const label = document.createElement("span");
      label.className = "key-label";
      label.textContent = word;
      cell.append(label);
      dom.phoneKeyGrid.append(cell);
    });
    fitKeyLabels(dom.phoneKeyGrid);
  }

  function loadPhoneKeyIfPresent() {
    const key = new URLSearchParams(window.location.search).get("key");
    if (!key) {
      return false;
    }
    try {
      renderPhoneKey(decodeKeyPayload(key));
    } catch (error) {
      dom.masthead.classList.add("hidden");
      dom.shell.classList.add("hidden");
      dom.phoneKeyView.classList.remove("hidden");
      dom.phoneKeyTitle.textContent = "Key link could not be opened";
      dom.phoneKeyGrid.textContent = "Ask the main device to create a new QR code.";
    }
    return true;
  }

  function prepareSharedKeys() {
    if (!state) {
      return;
    }
    dom.keyGridA.innerHTML = "";
    dom.keyGridB.innerHTML = "";
    dom.keyAlignStep.classList.remove("hidden");
    dom.keyRevealStep.classList.add("hidden");
    dom.keyDialog.showModal();
  }

  function revealSharedKeys() {
    renderKeyGrid(dom.keyGridA, "A");
    renderKeyGrid(dom.keyGridB, "B");
    dom.keyAlignStep.classList.add("hidden");
    dom.keyRevealStep.classList.remove("hidden");
  }

  dom.vocabInput.addEventListener("input", updateCustomCount);
  dom.vocabFile.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    const incoming = await file.text();
    dom.vocabInput.value = [dom.vocabInput.value.trim(), incoming.trim()].filter(Boolean).join("\n");
    updateCustomCount();
  });
  dom.setupForm.addEventListener("submit", beginMission);
  dom.clueForm.addEventListener("submit", beginGuessing);
  dom.endTurn.addEventListener("click", endTurn);
  dom.confirmBystander.addEventListener("click", confirmBystander);
  dom.suddenGuesser.addEventListener("change", renderBoard);
  window.addEventListener("resize", refitVisibleKeyLabels);
  document.querySelector("#prepare-keys").addEventListener("click", prepareSharedKeys);
  document.querySelector("#reveal-keys").addEventListener("click", revealSharedKeys);
  document.querySelector("#hide-key").addEventListener("click", () => dom.keyDialog.close());
  document.querySelector("#rules-open").addEventListener("click", () => dom.rulesDialog.showModal());
  document.querySelector("#rules-close").addEventListener("click", () => dom.rulesDialog.close());
  document.querySelector("#restart").addEventListener("click", () => beginMission(new Event("submit")));
  document.querySelector("#back-setup").addEventListener("click", () => {
    dom.gameView.classList.add("hidden");
    dom.setupView.classList.remove("hidden");
    hideBanner();
  });

  if (!loadPhoneKeyIfPresent()) {
    updateCustomCount();
  }
})();
