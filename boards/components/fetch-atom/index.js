/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { base, board } from "@google-labs/breadboard";
import { core } from "@google-labs/core-kit";
import { json } from "@google-labs/json-kit";

const metaData = {
  title: "Fetch an ATOM feed",
  description:
    "Fetch an ATOM feed and return the title and description of the first item.",
  version: "0.0.3",
};

const urlSchema = {
  type: "object",
  properties: {
    url: {
      type: "string",
      title: "URL",
      description: "The URL of the ATOM feed to fetch.",
    },
  },
  required: ["text"],
};

export default await board(() => {
  const fetchFeed = base
    .input({ $id: "input", schema: urlSchema })
    .url.to(
      core.fetch({
        $id: "fetch",
        raw: true,
      })
    )
    .response.as("xml")
    .to(json.xmlToJson({ $id: "xmlToJson" }));

  json
    .jsonata({
      json: fetchFeed.json,
      expression:
        "{ 'title': feed.title.`$t`[0], 'subtitle': feed.subtitle.`$t`[0],'description': feed.description.`$t`[0], 'link': feed.link.`$t`[0], 'updated': feed.updated.`$t`[0]}",
    })
    .result.as("feed")
    .to(base.output({ $id: "feedMetaData" }));

  return json
    .jsonata({
      json: fetchFeed.json,
      expression:
        '$map(feed.entry, function($v) { { "title": $v.title.`$t`[0], "description": $v.description.`$t`[0], "link": $v.link.href, "published": $v.published.`$t`[0], "updated": $v.updated.`$t`[0], "summary":$v.summary.`$t`[0], "content": $v.content.`$t`[0] }})',
    })
    .result.as("items")
    .to(base.output({ $id: "feedItems" }));
}).serialize(metaData);
