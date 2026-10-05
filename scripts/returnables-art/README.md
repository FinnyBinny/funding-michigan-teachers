# Returnables art

The crushed cans and pop bottles on `/returnables` are drawn by this folder,
not by hand. Each one is a 3D model of a real container, crushed, rendered as
metal or clear plastic, and given a painted-and-inked finish:

- 12 oz can
- 16 oz tall can
- slim 8.4 oz can
- 7.5 oz mini can
- 20 oz pop bottle (not water: Michigan's deposit covers carbonated drinks, not still water)

There are no brand logos. The only print is the Michigan "MI 10¢" deposit
mark and the volume.

| File | What it does |
|---|---|
| `items.json` | One entry per drawing: container size, colours, how crushed, how it leans. |
| `render.js` | The models and the 3D render (three.js, loaded from a CDN by `index.html`). |
| `finish.cjs` | The drawn look: a Kuwahara filter for flat, brush-like colour, an ink line on outlines and creases, and paper grain. |
| `items.cjs` | Renders every item at one scale and writes AVIF + WebP to `public/images/returnables/`. |

## Regenerating

```sh
cd scripts/returnables-art
npm i --no-save playwright          # the browser that does the rendering
npx playwright install chromium     # skip if you already have one; or set CHROMIUM_PATH
python3 -m http.server 8990 &       # serves index.html (needs internet for three.js)
node items.cjs                      # all items, or name some: node items.cjs can-red
```

`items.cjs` prints each drawing's width and height. If they changed, copy them
into `ITEMS` in `src/components/ReturnableCans.tsx`, which needs them for
sizing. Every drawing comes out at the same scale, 2 px per millimetre, so
the page shows real sizes relative to each other.

To change a colour or a crush, edit `items.json` and rerun `items.cjs`. Keep
`seed` the same, and the folds stay the same.
