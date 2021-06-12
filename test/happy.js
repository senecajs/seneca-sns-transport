const Seneca = require('seneca')

const seneca = Seneca({ legacy: false })
  .test()
  .use('..', {
    prefix: 'foo:',
    SNS: {
      publish: function (args, done) {
        console.log('PUBLISH', args)
        done()
      },
    },
  })
  .add('role:foo', function (msg, done) {
    console.log('IN:', msg)
    done({ x: msg.x })
  })
  .client({ type: 'sns', pin: 'role:bar' })
  .listen({ type: 'sns' })

seneca.ready(function () {
  console.log('READY')

  seneca.act('role:bar,z:22', seneca.util.print)

  let lambda_handler = seneca.export('sns-transport/handler')

  lambda_handler(
    { Records: [{ Sns: { Message: '{"role":"foo","color":"red","x":1}' } }] },
    {},
    function (err, out) {
      console.log('RESULT', err, out)
    }
  )
})
