const amqp = require('amqplib')

const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost'
const rabbitmqUser = process.env.RABBITMQ_USER || 'guest'
const rabbitmqPassword = process.env.RABBITMQ_PASSWORD || 'guest'
const rabbitmqUrl = `amqp://${rabbitmqUser}:${rabbitmqPassword}@${rabbitmqHost}`

let connection = null
let channel = null

exports.connectToRabbitMQ = async function () {
  try {
    connection = await amqp.connect(rabbitmqUrl)
    channel = await connection.createChannel()
    
    await channel.assertQueue('thumbnail-generation', { durable: true })
    
    console.log("== Connected to RabbitMQ")
    return channel
  } catch (err) {
    console.error("== Error connecting to RabbitMQ:", err)
    throw err
  }
}

exports.getChannel = function () {
  return channel
}

exports.closeRabbitMQConnection = async function () {
  if (connection) {
    await connection.close()
    console.log("== RabbitMQ connection closed")
  }
}

exports.sendToQueue = async function (queueName, message) {
  if (!channel) {
    throw new Error("No RabbitMQ channel available")
  }
  
  const messageBuffer = Buffer.from(JSON.stringify(message))
  return channel.sendToQueue(queueName, messageBuffer, { persistent: true })
}
