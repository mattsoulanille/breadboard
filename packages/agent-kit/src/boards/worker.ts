/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { board } from "@google-labs/breadboard";
import { json } from "@google-labs/json-kit";
import { gemini } from "@google-labs/gemini-kit";

const sampleContext = JSON.stringify(
  [
    {
      role: "user",
      parts: [
        {
          text: `You are a brilliant poet who specializes in two-line rhyming poems.
Given any topic, you can quickly whip up a two-line rhyming poem about it.
Ready?

The topic is: the universe within us`,
        },
      ],
    },
  ],
  null,
  2
);

export default await board(({ generator, context, stopSequences }) => {
  generator.title("Generator").optional().default("gemini-generator.json");
  context
    .title("Context")
    .isArray()
    .format("multiline")
    .examples(sampleContext);
  stopSequences.title("Stop Sequences").isArray().optional().default("[]");

  const { context: generated, text: output } = gemini.text({
    $id: "generate",
    context,
    stopSequences,
    text: "unused", // A gross hack (see TODO in gemini-generator.ts)
  });

  const { result } = json.jsonata({
    $id: "assemble",
    expression: `$append(context ? context, [generated])`,
    generated,
    context,
  });

  result
    .title("Context")
    .isObject()
    .description("Agent context after generation");
  output.title("Output").isString().description("Agent's output");

  return { context: result, text: output };
}).serialize({
  title: "Worker",
  description: "The essential Agent building block",
  version: "0.0.1",
});
