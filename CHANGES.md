# Changes

## 0.6.0 2026-11-20

First entry of this change log. Earlier versions are on npm and in the
git history.

* Seneca 4: the peer dependency is `seneca` `^4.0.0` (there was no peer
  before). Seneca 3 users stay on `@seneca/sns-transport@0.5`.
* Node.js 24 or later (`engines.node` `>=24`).
* The plugin loads on Seneca 4. Seneca 4 validates options with shape,
  which read the default `SNS: () => ...` as a required class instance,
  so 0.5 failed at load with `invalid_plugin_option`, with or without
  the option. The default is still a stub client that logs
  `PROVIDE AWS SNS API`, and the `SNS` option must be a function (B13).
* Option objects are closed on Seneca 4: only `topic.prefix`,
  `topic.suffix` and `SNS` are accepted.
* The plugin stops at load with a clear message when the
  `transport/utils` export lacks `internalize_msg`, `externalize_msg`
  and `externalize_reply`, as it does when seneca-transport 8 or older
  is loaded first. `@seneca/transport` 9 keeps them (trap T17).
* Tests: a `node:test` suite with a stub SNS client replaces the
  `test/happy.js` script, which had no assertions. It covers the topic
  name, the Lambda handler for SNS, API Gateway and direct events, and
  runs with and without `@seneca/transport` loaded first. Live AWS SNS
  calls were not tested on Seneca 4.
* Development dependencies: `seneca` `^4.0.0` and `@seneca/transport`
  `^9.0.0`; `@hapi/lab` and `@hapi/code` are removed (they were unused).
* README: install with `seneca@^4`, usage and options.
* `files` lists what is published (the main file, README, CHANGES and
  LICENSE; `test/` and `.github/` are no longer in the package), and
  `publishConfig.access` is `public`.
