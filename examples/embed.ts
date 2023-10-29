import { run, runWatching } from "../mod.ts";

const inputs = [
  {
    src: "testfile/test.txt",
    dest: "test.txt",
  },
];

if (Deno.args[0] === "watch") {
  await runWatching({ inputs, out: "ebmedded.ts" });
} else {
  await run({ inputs, out: "embedded.ts" });
}
