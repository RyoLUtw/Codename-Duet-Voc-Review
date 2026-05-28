# Duet Vocabulary Mission

A no-install browser version of cooperative word-association gameplay for vocabulary practice. It uses the standard `5 x 5` word layout and two private key sides, with custom vocabulary support and a bundled learning-word fallback pool.

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

Choose `One device` or `Multi-device` before creating the mission. One-device mode uses `Set up shared keys`: align a folded piece of paper over the vertical divider, then reveal both keys; Side B is rotated for the opposite seat. Multi-device mode shows QR codes for Side A and Side B phones; the app must be served from a URL the phones can reach, not only from `localhost`.

Each clue-giver sees only their side, optionally enters a clue word and number, then the partner guesses. Green guesses contact agents; bystanders show a confirmation message before switching sides and are marked only when that same side is clue-giver again; assassins end the mission and turn black. When the timer tokens run out, sudden death allows guesses without clues, and any non-agent guess loses.

Rule reference: [official Codenames: Duet English rulebook](https://filemanager.czechgames.com/storage/files/codenames-duet/rules/codenames-duet-rules-en.pdf).
