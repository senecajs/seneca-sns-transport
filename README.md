![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js](http://senecajs.org) plugin

# @seneca/sns-transport

[![npm version](https://img.shields.io/npm/v/@seneca/sns-transport.svg)](https://npmjs.com/package/@seneca/sns-transport)
[![build](https://github.com/senecajs/seneca-sns-transport/actions/workflows/build.yml/badge.svg)](https://github.com/senecajs/seneca-sns-transport/actions/workflows/build.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/senecajs/seneca-sns-transport/badge.svg)](https://snyk.io/test/github/senecajs/seneca-sns-transport)

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|

## Install

```sh
npm install @seneca/sns-transport
```

## Quick Example

```js
require('seneca')()
  .use('@seneca/sns-transport', {
    // AWS SNS config
  })
```

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

```sh
npm run test
```

## Background

**Note:** This plugin is a work in progress. Uses [AWS SNS](https://aws.amazon.com/sns/) for message transport.
