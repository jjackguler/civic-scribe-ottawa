# How AI Got Here — animated documentary series

Twelve vertical episodes (about 60–75 s each) in the `chronicle` look of `zine.html`:
gold ink on a night sky, everything drawn in code, no photos of real people.
Each episode is one board in `boards/how-ai-got-here-NN.json`; scenes are new
drawing functions in `LOOKS.chronicle`. Facts come only from the board's cited
sources; myths are called myths.

| # | Title | Moments |
|---|---|---|
| 1 | Bronze and gears | Talos (myth), Antikythera mechanism, Hero of Alexandria's cart |
| 2 | Water, cams and music | Al-Jazari's automata (1206), the musical robot band |
| 3 | Reasoning by machine | Llull's wheels, Leibniz's stepped reckoner and dream of a calculus of thought |
| 4 | Punched cards | Jacquard's loom (1804), Babbage's Analytical Engine, Ada Lovelace's notes (1843) |
| 5 | Logic becomes algebra | Boole (1854), Shannon's switching circuits (1937) |
| 6 | Can machines think? | Turing's 1936 machine and 1950 imitation game |
| 7 | Artificial neurons | McCulloch & Pitts (1943), the Dartmouth workshop names "AI" (1956) |
| 8 | Summers and winters | Perceptron (1958), the first AI winter, expert systems |
| 9 | Learning from mistakes | Backpropagation (1986), Deep Blue beats Kasparov (1997) |
| 10 | Seeing | ImageNet and AlexNet (2012), GPUs |
| 11 | Attention | The Transformer (2017), AlphaGo (2016), AlphaFold |
| 12 | Talking machines | GPT models, ChatGPT (2022), today's agents |

## Making an episode (cheap path)
1. Write the board (narration in `say`, one scene per moment, `year` label per scene).
2. Check the picture without voice: `node render.mjs how-ai-got-here-NN --stills 2,10,20`.
3. Add the slug to `voice-queue.txt` and push the branch to `zine-voice-run`: the Zine voice
   workflow voices only the queued slugs with ElevenLabs and commits them to `zine-voice`.
4. Copy `zine-voice/<slug>/` into `voice/<slug>/`, optionally drop a Suno track (Pro plan)
   into `music/<slug>.mp3` with its credit in `music/<slug>.txt`, and render.
