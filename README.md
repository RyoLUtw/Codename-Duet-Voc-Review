# Duet Vocabulary Mission

A no-install browser version of word-association gameplay for vocabulary practice. It supports cooperative Duet-style play and standard competitive team play on customizable rectangular word layouts from 5 total words up to `8 x 8`, with custom vocabulary support and a bundled learning-word fallback pool.

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
- Choose rows and columns manually, or enter a target word count of at least 5 and use `Suggest size` to pick the closest rectangular board that minimizes extra filler words.
- If fewer custom entries are supplied than the selected board needs, the board is filled from the bundled 100-word lower-intermediate/intermediate pool.
- If more custom entries are supplied than the selected board needs, a random set is selected for the board.

## Play

Choose `Coop` or `Compete` before creating the board. Coop is the default and keeps the original Duet settings: `One device` or `Multi-device`, board-scaled timer token presets, and first clue-giver. One-device mode uses `Set up shared keys`: align a folded piece of paper over the vertical divider, then reveal both keys; Side B is rotated for the opposite seat. Multi-device mode shows QR codes for Side A and Side B phones; the app must be served from a URL the phones can reach, not only from `localhost`.

Each clue-giver sees only their side, optionally enters a clue word and number, then the partner guesses. Green guesses contact agents; bystanders show a confirmation message before switching sides and are marked only when that same side is clue-giver again; assassins end the mission and turn black. When the timer tokens run out, sudden death allows guesses without clues, and any non-agent guess loses.

In compete mode, choose `One device` or `Multi-device` and the starting team. The starting team has one more scaled agent than the other team and gives the first clue. Both spymasters use one shared key. One-device mode prompts guessing players to turn around, cover their eyes, or step away before the key is revealed, then shows a countdown timer with 30-second adjustments, pause/continue, and reset. Multi-device mode shows a QR code for a spymaster phone key. Correct team guesses may continue, bystanders end the turn, opponent agents are scored for the opponent and end the turn, and the assassin makes the guessing team lose.

Rule references: [official Codenames English rulebook](https://czechgames.com/files/rules/codenames-rules-en.pdf) and [official Codenames: Duet English rulebook](https://filemanager.czechgames.com/storage/files/codenames-duet/rules/codenames-duet-rules-en.pdf).
