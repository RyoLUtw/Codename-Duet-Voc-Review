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
    gameModes: document.querySelectorAll("input[name='game-mode']"),
    coopSettings: document.querySelector("#coop-settings"),
    competeSettings: document.querySelector("#compete-settings"),
    deviceModes: document.querySelectorAll("input[name='device-mode']"),
    competeDeviceModes: document.querySelectorAll("input[name='compete-device-mode']"),
    timerCount: document.querySelector("#timer-count"),
    firstGiver: document.querySelector("#first-giver"),
    tvMode: document.querySelector("#tv-mode"),
    startingTeam: document.querySelector("#starting-team"),
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
    qrToggle: document.querySelector("#qr-toggle"),
    qrCollapseContent: document.querySelector("#qr-collapse-content"),
    keyDialog: document.querySelector("#key-dialog"),
    keyAlignStep: document.querySelector("#key-align-step"),
    keyRevealStep: document.querySelector("#key-reveal-step"),
    keyGridA: document.querySelector("#key-grid-a"),
    keyGridB: document.querySelector("#key-grid-b"),
    competitiveKeyTimer: document.querySelector("#competitive-key-timer"),
    timerDisplay: document.querySelector("#timer-display"),
    timerStatus: document.querySelector("#timer-status"),
    timerMinus: document.querySelector("#timer-minus"),
    timerPlus: document.querySelector("#timer-plus"),
    timerPause: document.querySelector("#timer-pause"),
    timerReset: document.querySelector("#timer-reset"),
    rulesDialog: document.querySelector("#rules-dialog"),
    masthead: document.querySelector(".masthead"),
    shell: document.querySelector(".shell"),
    phoneKeyView: document.querySelector("#phone-key-view"),
    phoneKeyTitle: document.querySelector("#phone-key-title"),
    phoneKeyGrid: document.querySelector("#phone-key-grid")
  };

  let state = null;
  let keyTimerId = null;
  let keyTimerDuration = 60;
  let keyTimerRemaining = 60;
  let keyTimerPaused = true;
  let qrCodesCollapsed = false;

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

  function createCompetitiveKey(startingTeam) {
    const otherTeam = startingTeam === "red" ? "blue" : "red";
    const roles = [
      ...Array(9).fill(startingTeam),
      ...Array(8).fill(otherTeam),
      "assassin",
      ...Array(7).fill("bystander")
    ];
    return shuffle(roles);
  }

  function otherSide(side) {
    return side === "A" ? "B" : "A";
  }

  function selectedDeviceMode() {
    const selected = [...dom.deviceModes].find((input) => input.checked);
    return selected ? selected.value : "one";
  }

  function selectedCompeteDeviceMode() {
    const selected = [...dom.competeDeviceModes].find((input) => input.checked);
    return selected ? selected.value : "one";
  }

  function selectedGameMode() {
    const selected = [...dom.gameModes].find((input) => input.checked);
    return selected ? selected.value : "coop";
  }

  function updateModeSettings() {
    const compete = selectedGameMode() === "compete";
    dom.coopSettings.classList.toggle("hidden", compete);
    dom.competeSettings.classList.toggle("hidden", !compete);
  }

  function buildMission(customEntries) {
    const selectedCustom = shuffle(customEntries).slice(0, 25);
    const customKeys = new Set(selectedCustom.map((word) => word.toLocaleLowerCase()));
    const fillers = shuffle(WORD_POOL.filter((word) => !customKeys.has(word.toLocaleLowerCase())))
      .slice(0, 25 - selectedCustom.length);
    const board = shuffle([...selectedCustom, ...fillers]);
    const mode = selectedGameMode();
    const timerLimit = Number(dom.timerCount.value);

    state = {
      mode,
      board,
      customCount: selectedCustom.length,
      poolCount: fillers.length,
      keys: mode === "coop" ? createKey() : null,
      competitiveKey: mode === "compete" ? createCompetitiveKey(dom.startingTeam.value) : null,
      startingTeam: mode === "compete" ? dom.startingTeam.value : null,
      activeTeam: mode === "compete" ? dom.startingTeam.value : null,
      contacted: new Set(),
      revealed: new Set(),
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
      guessesThisTurn: 0,
      guessLimit: null,
      pendingBystander: null,
      deviceMode: mode === "coop" ? selectedDeviceMode() : selectedCompeteDeviceMode(),
      tvMode: mode === "coop" && dom.tvMode.checked,
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
    if (role === "red") {
      return "r";
    }
    if (role === "blue") {
      return "u";
    }
    if (role === "agent") {
      return "c";
    }
    if (role === "assassin") {
      return "a";
    }
    return "b";
  }

  function roleFromCode(code) {
    if (code === "r") {
      return "red";
    }
    if (code === "u") {
      return "blue";
    }
    if (code === "c") {
      return "agent";
    }
    if (code === "a") {
      return "assassin";
    }
    return "bystander";
  }

  function phoneKeyUrl(side) {
    const compete = state.mode === "compete";
    const payload = {
      mode: state.mode,
      side: compete ? "spymaster" : side,
      words: state.board,
      roles: compete ? state.competitiveKey.map(roleCode).join("") : state.keys[side].map(roleCode).join("")
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

  function renderQrCollapseState() {
    dom.qrCollapseContent.classList.toggle("hidden", qrCodesCollapsed);
    dom.qrToggle.setAttribute("aria-expanded", String(!qrCodesCollapsed));
    dom.qrToggle.textContent = qrCodesCollapsed ? "Show QR codes" : "Hide QR codes";
  }

  function toggleQrCodes() {
    qrCodesCollapsed = !qrCodesCollapsed;
    renderQrCollapseState();
  }

  function renderMultiDeviceKeys() {
    if (!state || state.deviceMode !== "multi") {
      dom.multiDeviceKeys.classList.add("hidden");
      return;
    }
    if (state.mode === "compete") {
      const keyUrl = phoneKeyUrl("spymaster");
      renderQrCode(dom.qrA, keyUrl);
      dom.qrA.closest(".qr-card").classList.add("wide");
      dom.qrA.closest(".qr-card").querySelector("h3").textContent = "Spymaster key";
      dom.qrLinkA.href = keyUrl;
      dom.qrLinkA.textContent = "Open spymaster key";
      dom.qrB.closest(".qr-card").classList.add("hidden");
      dom.multiDeviceKeys.querySelector(".eyebrow").textContent = "Phone key";
      dom.multiDeviceKeys.querySelector(".key-note").textContent = "Scan this QR code on a spymaster phone.";
      dom.multiDeviceKeys.querySelector(".qr-note").textContent = "The phone must be able to reach this page's web address. Localhost works only on this device.";
      renderQrCollapseState();
      dom.multiDeviceKeys.classList.remove("hidden");
      return;
    }
    const sideAUrl = phoneKeyUrl("A");
    const sideBUrl = phoneKeyUrl("B");
    dom.qrA.closest(".qr-card").classList.remove("wide");
    dom.qrB.closest(".qr-card").classList.remove("hidden");
    dom.qrA.closest(".qr-card").querySelector("h3").textContent = "Side A";
    dom.qrB.closest(".qr-card").querySelector("h3").textContent = "Side B";
    renderQrCode(dom.qrA, sideAUrl);
    renderQrCode(dom.qrB, sideBUrl);
    dom.qrLinkA.href = sideAUrl;
    dom.qrLinkB.href = sideBUrl;
    dom.qrLinkA.textContent = "Open Side A key";
    dom.qrLinkB.textContent = "Open Side B key";
    dom.multiDeviceKeys.querySelector(".eyebrow").textContent = "Phone keys";
    dom.multiDeviceKeys.querySelector(".key-note").textContent = "Scan each QR code with the matching player's phone.";
    dom.multiDeviceKeys.querySelector(".qr-note").textContent = "Phones must be able to reach this page's web address. Localhost works only on this device.";
    renderQrCollapseState();
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
    const visibleBystanders = state.mode === "coop" ? state.bystanders[state.clueGiver] || new Set() : new Set();
    dom.board.innerHTML = "";
    state.board.forEach((word, index) => {
      const card = document.createElement("button");
      const classes = ["word-card"];
      const competitiveRole = state.mode === "compete" && state.revealed.has(index)
        ? state.competitiveKey[index]
        : null;
      if (state.mode === "compete" && competitiveRole) {
        classes.push(`revealed-${competitiveRole}`);
      } else if (state.contacted.has(index)) {
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
      card.disabled = Boolean(state.pendingBystander) || state.contacted.has(index) || state.revealed.has(index) || ["clue", "won", "lost"].includes(state.phase);
      card.textContent = word;

      if (competitiveRole === "red" || competitiveRole === "blue") {
        const mark = document.createElement("small");
        mark.textContent = competitiveRole;
        card.append(mark);
      } else if (competitiveRole === "bystander") {
        const mark = document.createElement("small");
        mark.textContent = "bystander";
        card.append(mark);
      } else if (competitiveRole === "assassin") {
        const mark = document.createElement("small");
        mark.textContent = "assassin";
        card.append(mark);
      } else if (state.contacted.has(index)) {
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

  function competitiveFound(team) {
    return [...state.revealed].filter((index) => state.competitiveKey[index] === team).length;
  }

  function teamName(team) {
    return team === "red" ? "Red" : "Blue";
  }

  function otherTeam(team) {
    return team === "red" ? "blue" : "red";
  }

  function render() {
    const guesser = otherSide(state.clueGiver);
    const normalGuess = state.phase === "guess";
    const over = state.phase === "won" || state.phase === "lost";
    const compete = state.mode === "compete";
    if (compete) {
      dom.agentsFound.textContent = `${competitiveFound("red")}/${state.startingTeam === "red" ? 9 : 8}`;
      dom.agentsFound.nextElementSibling.textContent = "red agents";
      dom.tokensLeft.textContent = `${competitiveFound("blue")}/${state.startingTeam === "blue" ? 9 : 8}`;
      dom.tokensLeft.nextElementSibling.textContent = "blue agents";
    } else {
      dom.agentsFound.textContent = String(state.contacted.size);
      dom.agentsFound.nextElementSibling.textContent = "of 15 agents";
      dom.tokensLeft.textContent = String(state.tokens);
      dom.tokensLeft.nextElementSibling.textContent = "turns left";
    }
    dom.customUsed.textContent = String(state.customCount);
    dom.boardSource.textContent = `${state.customCount} custom word${state.customCount === 1 ? "" : "s"} and ${state.poolCount} learning-pool word${state.poolCount === 1 ? "" : "s"} on this board.`;
    dom.clueForm.classList.toggle("hidden", state.phase !== "clue");
    dom.guessActions.classList.toggle("hidden", !normalGuess);
    dom.suddenControls.classList.toggle("hidden", compete || state.phase !== "sudden");
    const keyActions = document.querySelector(".key-actions");
    keyActions.classList.toggle("hidden", state.deviceMode === "multi");
    keyActions.querySelector(".eyebrow").textContent = compete ? "Spymaster key" : "Private keys";
    keyActions.querySelector(".key-note").textContent = compete ? "Reveal only to spymasters." : "Use a paper screen between players.";
    keyActions.querySelector("button").textContent = compete ? "Show shared key" : "Set up shared keys";
    renderMultiDeviceKeys();

    if (state.phase === "clue") {
      dom.turnHeading.textContent = compete ? `${teamName(state.activeTeam)} spymaster gives a clue` : `Side ${state.clueGiver} gives a clue`;
      dom.turnGuidance.textContent = compete
        ? "Open the shared spymaster key when both spymasters need the board map."
        : "Reveal the separated shared keys when players need their private information.";
      dom.phasePill.textContent = "Clue";
    } else if (normalGuess) {
      dom.turnHeading.textContent = compete ? `${teamName(state.activeTeam)} operatives guess` : `Side ${guesser} guesses`;
      dom.turnGuidance.textContent = compete
        ? "Select team words, or end the turn after at least one guess."
        : "Select words on the board, or end the turn after at least one guess.";
      dom.phasePill.textContent = "Guess";
      dom.activeClue.textContent = state.clue.label;
      dom.endTurn.disabled = !state.hasGuessed || Boolean(state.pendingBystander);
    } else if (state.phase === "sudden") {
      dom.turnHeading.textContent = "Sudden death";
      dom.turnGuidance.textContent = "No clues remain. A single bystander or assassin guess ends the mission.";
      dom.phasePill.textContent = "Sudden death";
    } else {
      dom.turnHeading.textContent = state.phase === "won" ? "Mission complete" : "Mission failed";
      dom.turnGuidance.textContent = compete
        ? "Start a new game from the vocabulary screen."
        : state.phase === "won"
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
    state.guessesThisTurn = 0;
    state.guessLimit = state.mode === "compete" ? competitiveGuessLimit(dom.clueNumber.value.trim()) : null;
    logEvent(state.mode === "compete" ? `${teamName(state.activeTeam)}: ${state.clue.label}` : `Side ${state.clueGiver}: ${state.clue.label}`);
    render();
  }

  function competitiveGuessLimit(numberText) {
    if (numberText === "0") {
      return Infinity;
    }
    const number = Number.parseInt(numberText, 10);
    return Number.isFinite(number) && number > 0 ? number + 1 : Infinity;
  }

  function spendTurn(reason) {
    if (state.mode === "compete") {
      if (reason) {
        logEvent(reason);
      }
      state.activeTeam = otherTeam(state.activeTeam);
      state.phase = "clue";
      state.clue = null;
      state.hasGuessed = false;
      state.guessesThisTurn = 0;
      state.guessLimit = null;
      dom.clueWord.value = "";
      dom.clueNumber.value = "";
      return;
    }
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
    if (state.mode === "compete") {
      logEvent(`${teamName(state.activeTeam)} contacted all agents.`);
      showBanner(`${teamName(state.activeTeam)} team wins.`);
    } else {
      logEvent("All 15 agents contacted.");
      showBanner("Mission complete: all 15 agents contacted.");
    }
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
    if (state.mode === "compete") {
      makeCompetitiveGuess(index);
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

  function makeCompetitiveGuess(index) {
    if (state.revealed.has(index)) {
      return;
    }
    const result = state.competitiveKey[index];
    const word = state.board[index];
    const team = state.activeTeam;
    const opponent = otherTeam(team);
    state.revealed.add(index);
    state.hasGuessed = true;
    state.guessesThisTurn += 1;

    if (result === team) {
      logEvent(`${word}: ${teamName(team)} agent found.`);
      if (competitiveFound(team) === (state.startingTeam === team ? 9 : 8)) {
        succeed();
      } else if (state.guessesThisTurn >= state.guessLimit) {
        spendTurn(`${teamName(team)} reached the clue limit. Turn ended.`);
      }
    } else if (result === opponent) {
      logEvent(`${word}: ${teamName(opponent)} agent revealed.`);
      if (competitiveFound(opponent) === (state.startingTeam === opponent ? 9 : 8)) {
        state.activeTeam = opponent;
        succeed();
      } else {
        spendTurn(`${teamName(team)} revealed an opponent agent. Turn ended.`);
      }
    } else if (result === "assassin") {
      state.activeTeam = opponent;
      fail(`${word} was the assassin. ${teamName(opponent)} team wins.`, index);
    } else {
      spendTurn(`${word}: innocent bystander. Turn ended.`);
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
      const result = state.mode === "compete" ? state.competitiveKey[index] : state.keys[side][index];
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
    const compete = payload.mode === "compete";
    dom.phoneKeyTitle.textContent = compete ? "Spymaster key" : `Side ${payload.side} key`;
    const legend = dom.phoneKeyView.querySelector(".legend");
    legend.innerHTML = compete
      ? `
        <span class="red">Red</span>
        <span class="blue">Blue</span>
        <span class="bystander">Bystander</span>
        <span class="assassin">Assassin</span>
      `
      : `
        <span class="agent">Contact</span>
        <span class="bystander">Bystander</span>
        <span class="assassin">Assassin</span>
      `;
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

  function formatTimer(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  }

  function renderKeyTimer() {
    dom.timerDisplay.textContent = formatTimer(keyTimerRemaining);
    dom.timerPause.textContent = keyTimerPaused ? "Continue" : "Pause";
    dom.timerStatus.textContent = keyTimerRemaining === 0 ? "Time's up" : keyTimerPaused ? "Paused" : "Running";
    dom.timerMinus.disabled = keyTimerDuration <= 30;
  }

  function stopKeyTimer() {
    if (keyTimerId) {
      clearInterval(keyTimerId);
      keyTimerId = null;
    }
  }

  function startKeyTimer() {
    stopKeyTimer();
    keyTimerPaused = false;
    renderKeyTimer();
    keyTimerId = window.setInterval(() => {
      if (keyTimerPaused || keyTimerRemaining === 0) {
        return;
      }
      keyTimerRemaining -= 1;
      if (keyTimerRemaining === 0) {
        keyTimerPaused = true;
        stopKeyTimer();
      }
      renderKeyTimer();
    }, 1000);
  }

  function resetKeyTimer() {
    keyTimerRemaining = keyTimerDuration;
    startKeyTimer();
  }

  function adjustKeyTimer(change) {
    const nextDuration = Math.max(30, keyTimerDuration + change);
    const delta = nextDuration - keyTimerDuration;
    keyTimerDuration = nextDuration;
    keyTimerRemaining = Math.max(0, keyTimerRemaining + delta);
    renderKeyTimer();
  }

  function toggleKeyTimer() {
    if (keyTimerRemaining === 0) {
      resetKeyTimer();
      return;
    }
    if (keyTimerPaused && !keyTimerId) {
      startKeyTimer();
      return;
    }
    keyTimerPaused = !keyTimerPaused;
    renderKeyTimer();
  }

  function prepareKeyTimer() {
    keyTimerDuration = 60;
    keyTimerRemaining = keyTimerDuration;
    keyTimerPaused = true;
    stopKeyTimer();
    renderKeyTimer();
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
    dom.competitiveKeyTimer.classList.add("hidden");
    stopKeyTimer();
    dom.keyRevealStep.classList.toggle("competitive-key", state.mode === "compete");
    dom.keyRevealStep.classList.toggle("tv-mode", state.tvMode);
    dom.keyAlignStep.classList.toggle("competitive-privacy-step", state.mode === "compete");
    dom.keyAlignStep.classList.remove("hidden");
    dom.keyRevealStep.classList.add("hidden");
    dom.keyAlignStep.querySelector(".eyebrow").textContent = state.mode === "compete" ? "Privacy check" : "Step 1";
    dom.keyAlignStep.querySelector("h2").textContent = state.mode === "compete" ? "Ask operatives to turn around" : "Align your paper screen";
    dom.keyAlignStep.querySelector("p:not(.eyebrow)").textContent = state.mode === "compete"
      ? "Before revealing the shared key, all guessing players should turn around, cover their eyes, or step away from the screen. Only spymasters should look."
      : "Place a folded piece of paper vertically along the center line. Keep it in place, then Side A can reveal both private keys.";
    document.querySelector("#reveal-keys").textContent = state.mode === "compete" ? "Operatives are not looking" : "Step 2: Reveal keys";
    dom.keyDialog.showModal();
  }

  function revealSharedKeys() {
    if (state.mode === "compete") {
      prepareKeyTimer();
      renderKeyGrid(dom.keyGridA, "competitive");
      dom.keyGridB.innerHTML = "";
      dom.competitiveKeyTimer.classList.remove("hidden");
      document.querySelector(".key-half.side-a .eyebrow").textContent = "Spymaster view";
      document.querySelector(".key-half.side-a h2").textContent = "Shared key";
      document.querySelector(".key-half.side-a .privacy").textContent = "Keep this hidden from operatives.";
      document.querySelector(".key-half.side-a .legend").innerHTML = `
        <span class="red">Red</span>
        <span class="blue">Blue</span>
        <span class="bystander">Bystander</span>
        <span class="assassin">Assassin</span>
      `;
    } else {
      renderKeyGrid(dom.keyGridA, "A");
      renderKeyGrid(dom.keyGridB, "B");
      dom.competitiveKeyTimer.classList.add("hidden");
      stopKeyTimer();
      document.querySelector(".key-half.side-a .eyebrow").textContent = "Player view";
      document.querySelector(".key-half.side-a h2").textContent = "Side A key";
      document.querySelector(".key-half.side-a .privacy").textContent = "Keep the paper screen in place.";
      document.querySelector(".key-half.side-a .legend").innerHTML = `
        <span class="agent">Agent</span>
        <span class="bystander">Bystander</span>
        <span class="assassin">Assassin</span>
      `;
    }
    dom.keyAlignStep.classList.add("hidden");
    dom.keyRevealStep.classList.remove("hidden");
    if (state.mode === "compete") {
      startKeyTimer();
    }
  }

  dom.gameModes.forEach((input) => input.addEventListener("change", updateModeSettings));
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
  dom.qrToggle.addEventListener("click", toggleQrCodes);
  dom.timerMinus.addEventListener("click", () => adjustKeyTimer(-30));
  dom.timerPlus.addEventListener("click", () => adjustKeyTimer(30));
  dom.timerPause.addEventListener("click", toggleKeyTimer);
  dom.timerReset.addEventListener("click", resetKeyTimer);
  dom.keyDialog.addEventListener("close", stopKeyTimer);
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
    updateModeSettings();
    updateCustomCount();
  }
})();
