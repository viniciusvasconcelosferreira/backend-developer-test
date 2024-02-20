const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const sqs = new AWS.SQS();


const awsService = {
  getFileFromS3: async (key) => {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET, Key: key ?? process.env.AWS_S3_KEY,
    };

    try {
      const data = await s3.getObject(params).promise();
      return JSON.parse(data.Body.toString());
    } catch (error) {
      console.error('Erro ao obter arquivo do S3:', error);
      throw error;
    }
  },

  updateFileInS3: async (key, data) => {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key ?? process.env.AWS_S3_KEY,
      Body: JSON.stringify(data),
      ContentType: 'application/json',
    };

    try {
      await s3.putObject(params).promise();
    } catch (error) {
      console.error('Erro ao atualizar arquivo no S3:', error);
      throw error;
    }
  },

  sendMessageToSQS: async (messageBody) => {
    const params = {
      MessageBody: JSON.stringify(messageBody),
      QueueUrl: process.env.AWS_SQS_URL,
    };

    try {
      await sqs.sendMessage(params).promise();
    } catch (error) {
      console.error('Erro ao enviar mensagem para a fila SQS:', error);
      throw error;
    }
  },
};

module.exports = {
  awsService,
};
