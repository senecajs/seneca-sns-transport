module.exports = sns_transport

module.exports.defaults = {
  topic: {
    prefix: '',
    suffix: '',
  },
  SNS: () => ({
    publish: () => {
      console.error('PROVIDE AWS SNS API')
    },
  }),
}

function sns_transport(options) {
  const seneca = this
  const tu = seneca.export('transport/utils')

  seneca.add('role:transport,hook:listen,type:sns', hook_listen_sns)
  seneca.add('role:transport,hook:client,type:sns', hook_client_sns)

  let handle_msg = null

  function hook_listen_sns(config, ready) {
    let seneca = this.root.delegate()

    handle_msg = function handle_msg(data, done) {
      let msg = tu.internalize_msg(
        seneca,
        'string' === typeof data ? JSON.parse(data) : data
      )

      seneca.act(msg, function (err, out, meta) {
        let rep = JSON.stringify(tu.externalize_reply(seneca, err, out, meta))
        return done(rep)
      })
    }

    return ready(config)
  }

  function hook_client_sns(config, ready) {
    let seneca = this.root.delegate()

    function send_msg(msg, reply, meta) {
      let msgstr = JSON.stringify(tu.externalize_msg(seneca, msg, meta))
      let topicarn = resolve_topic(msg, meta)
      options.SNS().publish(
        {
          Message: msgstr,
          TopicArn: topicarn,
        },
        function (err, out) {
          seneca.log.debug('SENT', topicarn)
          seneca.log.debug('SENT', msgstr)
          seneca.log.debug('SENT', err)
          seneca.log.debug('SENT', out)
        }
      )

      // just async msgs
      reply()
    }

    return ready({
      config: config,
      send: send_msg,
    })
  }

  function lambda_handler(event, context, callback) {
    let msg = event.Records
      ? event.Records[0].Sns.Message
      : event.routekey
      ? { ...event.queryStringParameters, ...event.pathParameters }
      : event

    handle_msg(msg, function (repstr) {
      const res = {
        statusCode: 200,
        body: repstr,
      }

      callback(null, res)
    })
  }

  function resolve_topic(msg, meta) {
    let pattern = meta.pattern
    let topic =
      options.topic.prefix +
      pattern.replace(/[,:]/g, '_') +
      options.topic.suffix
    return topic
  }

  return {
    name: 'sns-transport',
    exportmap: {
      lambda_handler: lambda_handler,
    },
  }
}

sns_transport.preload = function (plugin) {
  let seneca = this.root
  return {
    name: 'sns-transport',
    exportmap: {
      handler: function sns_handler(event, context, callback) {
        seneca.ready(function () {
          let handler = seneca.export('sns-transport/lambda_handler')
          return handler(event, context, callback)
        })
      },
    },
  }
}
