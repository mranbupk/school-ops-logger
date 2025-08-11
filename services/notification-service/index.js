const { KafkaClient } = require('node-kafka-pubsub');
require('dotenv').config();

const kafka = new KafkaClient({
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  clientId: process.env.KAFKA_CLIENT_ID || 'notification-service'
});

async function start() {
  await kafka.init();
  await kafka.createConsumer(
    { groupId: 'notification-service', topics: [process.env.KAFKA_TOPIC_STUDENTS || 'school.students.v1'] },
    async ({ decodedValue, key }) => {
      console.log('🔔 Notification consumer received:', decodedValue);
      // here you could send email/SMS etc.
    }
  );
}

start().catch(err => {
  console.error('Notification service error:', err);
  process.exit(1);
}); 