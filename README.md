# Simple Embed

Embed any file for use in a Deno standalone executable.


## Usage
The following script will embed all specified files into `embedded.ts` using simple embed.
```ts
import { run, runWatching } from "https://deno.land/x/simple_embed/mod.ts";

const opts = {
  inputs: [
    {
      src: "testfile/test.txt",
      dest: "test.txt",
    },
  ],
  out: "embedded.ts"
}

if (Deno.args[0] === "watch") {
  await runWatching(opts);
} else {
  await run(opts);
}
```

Run `deno run -A embed.ts watch` while developing, and you'll be able to use your embedded files like so:

```ts
import { getFile } from './embedded.ts';
console.log(getFile("test.txt"));
```

## Why?
Because Deno does not have an `--embed` (or similar) option, so we can not embed static files into executables without a separate build step.

## License
MIT.