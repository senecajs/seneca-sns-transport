/* Copyright (c) 2021-2026 Richard Rodger and other contributors, MIT License */
'use strict'

const { describe, test } = require('node:test')
const assert = require('node:assert/strict')

const Seneca = require('seneca')
const SnsTransport = require('..')

// A stub for the SNS option: records each publish, so no AWS account is needed.
function make_sns() {
  const published = []
  return {
    published,
    SNS: () => ({
      publish(params, done) {
        published.push(params)
        done(null, { MessageId: 'm' + published.length })
      },
    }),
  }
}

function make_seneca(options, first) {
  const seneca = Seneca({ legacy: false }).test()
  if (first) {
    first(seneca)
  }
  return seneca.use(SnsTransport, options)
}

function call(handler, event) {
  return new Promise((resolve, reject) =>
    handler(event, {}, (err, res) => (err ? reject(err) : resolve(res)))
  )
}

describe('sns-transport', () => {
  test('loads without options', async (t) => {
    const errors = t.mock.method(console, 'error', () => {})
    const seneca = make_seneca().client({ type: 'sns', pin: 'role:bar' })
    await seneca.ready()

    assert.ok(seneca.find_plugin('sns-transport'))
    assert.equal(typeof seneca.export('sns-transport/handler'), 'function')

    // The default SNS client only warns that no SNS API was provided.
    await seneca.post('role:bar,z:1')
    assert.equal(errors.mock.callCount(), 1)
    assert.equal(errors.mock.calls[0].arguments[0], 'PROVIDE AWS SNS API')

    await seneca.close()
  })

  test('rejects an SNS option that is not a function', async () => {
    const errs = []
    const seneca = Seneca({ legacy: false, debug: { undead: true } }).test(
      (err) => errs.push(err),
      'silent'
    )
    seneca.use(SnsTransport, { SNS: 'not-a-function' })
    await new Promise((resolve) => seneca.ready(() => resolve()))

    assert.equal(errs[0] && errs[0].code, 'invalid_plugin_option')
    await seneca.close()
  })

  for (const [label, first] of [
    ['core transport/utils', null],
    ['@seneca/transport loaded first', (s) => s.use('@seneca/transport')],
  ]) {
    describe(label, () => {
      test('client publishes to the topic named from the pattern', async () => {
        const sns = make_sns()
        const seneca = make_seneca(
          { topic: { prefix: 'foo_', suffix: '_bar' }, SNS: sns.SNS },
          first
        ).client({ type: 'sns', pin: 'role:bar' })
        await seneca.ready()

        await seneca.post('role:bar,z:22')

        assert.equal(sns.published.length, 1)
        assert.equal(sns.published[0].TopicArn, 'foo_role_bar_bar')
        const msg = JSON.parse(sns.published[0].Message)
        assert.equal(msg.role, 'bar')
        assert.equal(msg.z, 22)

        await seneca.close()
      })

      test('lambda handler acts the message and returns the reply', async () => {
        const sns = make_sns()
        const seneca = make_seneca({ SNS: sns.SNS }, first)
          .add('role:foo', function (msg, reply) {
            reply({ x: msg.x })
          })
          .listen({ type: 'sns' })
        await seneca.ready()

        const handler = seneca.export('sns-transport/handler')

        // SNS notification
        let res = await call(handler, {
          Records: [{ Sns: { Message: '{"role":"foo","x":1}' } }],
        })
        assert.equal(res.statusCode, 200)
        assert.equal(res.headers['Access-Control-Allow-Origin'], '*')
        assert.equal(JSON.parse(res.body).x, 1)

        // API Gateway HTTP API request
        res = await call(handler, {
          routeKey: 'GET /foo/{x}',
          queryStringParameters: { role: 'foo' },
          pathParameters: { x: '2' },
        })
        assert.equal(res.statusCode, 200)
        assert.equal(JSON.parse(res.body).x, '2')

        // Direct invocation with the message as the event
        res = await call(handler, { role: 'foo', x: 3 })
        assert.equal(JSON.parse(res.body).x, 3)

        await seneca.close()
      })
    })
  }
})
