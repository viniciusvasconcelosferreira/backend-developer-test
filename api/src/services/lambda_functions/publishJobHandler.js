const axios = require('axios');
const { pool } = require('../../../config/db.config');
const statusType = require('../../enums/statusTypes');
const { awsService } = require('../awsService');

exports.handler = async (event) => {
  try {
    const job_id = event.job_id;

    if (!job_id) {
      throw new Error('ID de trabalho inválido');
    }

    const { rows: [job] } = await pool.query(`SELECT * FROM jobs WHERE id = $1`, [job_id]);

    if (!job) {
      throw new Error('Trabalho não encontrado');
    }

    const openAIEndpoint = 'https://api.openai.com/v1/engines/davinci-codex/completions';
    const prompt = `Avalie o seguinte conteúdo para conteúdo prejudicial: ${job.title} ${job.description}`;
    const response = await axios.post(openAIEndpoint, {
      prompt,
      max_tokens: 60,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    // Verificar a resposta da AI e atualizar o status do trabalho
    const aiResponse = response.data.choices[0].text.trim();
    const updateQuery = aiResponse === 'safe'
      ? `UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = $2`
      : `UPDATE jobs SET status = $1, notes = $2, updated_at = NOW() WHERE id = $3`;

    const values = aiResponse === 'safe'
      ? [statusType.PUBLISHED, job_id]
      : [statusType.REJECTED, aiResponse, job_id];

    await pool.query(updateQuery, values);

    const publishedJobs = await pool.query('SELECT * FROM jobs WHERE status = $1', [statusType.PUBLISHED]);
    await awsService.updateFileInS3('', JSON.stringify(publishedJobs));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Emprego publicado com sucesso' }),
    };
  } catch (error) {
    console.error('Erro ao publicar emprego:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro interno do servidor' }),
    };
  }
};