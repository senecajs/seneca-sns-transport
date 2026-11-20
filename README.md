![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js](http://senecajs.org) plugin

# @seneca/sns-transport

[![npm version](https://img.shields.io/npm/v/@seneca/sns-transport.svg)](https://npmjs.com/package/@seneca/sns-transport)
[![build](https://github.com/senecajs/seneca-sns-transport/actions/workflows/build.yml/badge.svg)](https://github.com/senecajs/seneca-sns-transport/actions/workflows/build.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/senecajs/seneca-sns-transport/badge.svg)](https://snyk.io/test/github/senecajs/seneca-sns-transport)

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|

## Install

Version 0.6 needs Seneca 4 and Node.js 24 or later. Seneca 3 users stay
on `@seneca/sns-transport@0.5`.

```sh
npm install seneca@^4 @seneca/sns-transport
```

## Quick Example

Client side: messages that match the pin are published to an SNS topic.

```js
const AWS = require('aws-sdk') // any object with publish(params, callback)

require('seneca')()
  .use('@seneca/sns-transport', {
    topic: { prefix: 'arn:aws:sns:eu-west-1:123456789012:' },
    SNS: () => new AWS.SNS(),
  })
  .client({ type: 'sns', pin: 'role:bar' })
```

Listen side, in an AWS Lambda function subscribed to the topic:

```js
const seneca = require('seneca')()
  .use('@seneca/sns-transport')
  .add('role:bar', function (msg, reply) {
    reply({ ok: true })
  })
  .listen({ type: 'sns' })

exports.handler = seneca.export('sns-transport/handler')
```

## Options

| Option | Default | Description |
| ------ | ------- | ----------- |
| `topic.prefix` | `''` | Prepended to the topic name. |
| `topic.suffix` | `''` | Appended to the topic name. |
| `SNS` | a stub that logs `PROVIDE AWS SNS API` | A function that returns the SNS client. The client needs `publish({ Message, TopicArn }, callback)`. |

The client publishes each message to the topic
`topic.prefix + pattern + topic.suffix`, where `pattern` is the matched
pin with `,` and `:` replaced by `_`: the pin `role:bar` gives
`role_bar`. Messages are fire-and-forget: the client replies at once,
without a result.

The `sns-transport/handler` export is an AWS Lambda handler. It accepts
an SNS notification (`Records[0].Sns.Message`), an API Gateway HTTP API
request (query string and path parameters become the message), or the
message itself. It replies with status code 200 and the action result as
a JSON body.

## More Examples

See [test/](test/) for more usage examples.

## Motivation

AWS SNS transport plugin for Seneca microservices.

## Support

If you're using this module and need help, you can:

- Post a [github issue](https://github.com/senecajs/seneca-sns-transport/issues)
- Tweet to [@senecajs](http://twitter.com/senecajs)
- Ask on the [Gitter](https://gitter.im/senecajs/seneca)

## API

See [source](https://github.com/senecajs/seneca-sns-transport) for API details.

## Contributing

The [Senecajs org](https://github.com/senecajs/) encourages open participation. If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.

### Running tests

The tests use a stub SNS client, so they need no AWS account:

```sh
npm install
npm test
```

## Background

**Note:** This plugin is a work in progress. Uses [AWS SNS](https://aws.amazon.com/sns/) for message transport.
