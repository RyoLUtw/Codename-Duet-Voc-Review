# Duet Vocabulary Mission

A no-install browser version of word-association gameplay for vocabulary practice. It supports cooperative Duet-style play and standard competitive team play on a `5 x 5` word layout, with custom vocabulary support and a bundled learning-word fallback pool.

## Run

Open `index.html` in a browser, or serve the directory locally:

```powershell
npx serve .
```

Then open the local URL shown by the server.

## Vocabulary

- Paste entries into the setup area, one per line or separated by commas, semicolons, or tabs.
- Alternatively upload a `.txt` or `.csv` file.
- Duplicate entries are removed case-insensitively.
- If fewer than 25 custom entries are supplied, the board is filled from the bundled 100-word lower-intermediate/intermediate pool.
- If more than 25 custom entries are supplied, 25 are randomly selected for the board.

## Play

Choose `Coop` or `Compete` before creating the board. Coop is the default and keeps the original Duet settings: `One device` or `Multi-device`, timer tokens, and first clue-giver. One-device mode uses `Set up shared keys`: align a folded piece of paper over the vertical divider, then reveal both keys; Side B is rotated for the opposite seat. Multi-device mode shows QR codes for Side A and Side B phones; the app must be served from a URL the phones can reach, not only from `localhost`.

Each clue-giver sees only their side, optionally enters a clue word and number, then the partner guesses. Green guesses contact agents; bystanders show a confirmation message before switching sides and are marked only when that same side is clue-giver again; assassins end the mission and turn black. When the timer tokens run out, sudden death allows guesses without clues, and any non-agent guess loses.

In compete mode, choose `One device` or `Multi-device` and the starting team. The starting team has 9 agents and gives the first clue; the other team has 8 agents. Both spymasters use one shared key. One-device mode prompts guessing players to turn around, cover their eyes, or step away before the key is revealed, then shows a countdown timer with 30-second adjustments, pause/continue, and reset. Multi-device mode shows a QR code for a spymaster phone key. Correct team guesses may continue, bystanders end the turn, opponent agents are scored for the opponent and end the turn, and the assassin makes the guessing team lose.

Rule references: [official Codenames English rulebook](https://czechgames.com/files/rules/codenames-rules-en.pdf) and [official Codenames: Duet English rulebook](https://filemanager.czechgames.com/storage/files/codenames-duet/rules/codenames-duet-rules-en.pdf).
