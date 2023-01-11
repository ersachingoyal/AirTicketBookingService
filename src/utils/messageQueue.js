const amqplib = require('amqplib');
const { EXCHANGE_NAME, MESSAGE_BROKER_URL } = require('../config/serverConfig');

const createChannel = async () => {
    try {
        const connection = await amqplib.connect(MESSAGE_BROKER_URL); //first we have to create a connection
        const channel = await connection.createChannel(); //then we need to create a channel through that connection
        await channel.assertExchange(EXCHANGE_NAME, 'direct', false); //will create an exchange for the channel, the exchange checks to which queue the msg needs to be redirected as we can have multiple queues
        //the producer which produces the msg sends it to the exchange or distributor we can and exchange decides to which queue the msg need to go, and this msg redirection is done based on the binding the queue is having
        return channel;
    } catch (error) {
        throw error;
    }
}

const subscribeMessage = async (channel, service, binding_key) => {
    try {
      const applicationQueue = await channel.assertQueue("REMINDER_QUEUE");
      channel.bindQueue(applicationQueue.queue, EXCHANGE_NAME, binding_key);

      channel.consume(applicationQueue.queue, (msg) => {
        console.log("recieved data");
        console.log(msg.content.toString());
        channel.ack(msg);
      });
    } catch (error) {
      throw error;
    }
    
}

const publishMessage = async (channel, binding_key, message) => { //binding_key is used to redirect the msg to the respective queue, because we can have multiple queues simultaneously
    try {
        await channel.assertQueue("REMINDER_QUEUE");
        await channel.publish(EXCHANGE_NAME, binding_key, Buffer.from(message));
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createChannel,
    subscribeMessage,
    publishMessage
}