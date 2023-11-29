import { run, runWatching } from "../mod.ts";

const opts = {
  inputs: [
    {
      src: "testfile/test.txt",
      dest: "test.txt",
    },
  ],
  out: "embedded.ts",
};

if (Deno.args[0] === "watch") {
  await runWatching(opts);
} else {
  await run(opts);
}
