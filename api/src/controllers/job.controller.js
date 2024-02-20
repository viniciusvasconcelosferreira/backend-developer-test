const { pool } = require('../../config/db.config');
const StatusTypes = require('../enums/statusTypes');
const { awsService } = require('../services/awsService');

const getAllJobs = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jobs');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao obter empregos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const searchJobs = async (req, res) => {
  const searchQuery = req.query.q;

  try {
    const result = await pool.query('SELECT * FROM jobs WHERE title ILIKE $1 OR description ILIKE $1 OR location ILIKE $1', [`%${searchQuery}%`]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar empregos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getJobById = async (req, res) => {
  const job_id = req.params.id;

  try {
    const result = await pool.query('SELECT * FROM jobs WHERE id = $1', [job_id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Emprego não encontrado' });
    } else {
      res.status(200).json({ message: 'Emprego encontrado com sucesso', data: result.rows[0] });
    }
  } catch (error) {
    console.error('Erro ao obter emprego por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getFeedJobs = async (req, res) => {
  try {
    const feedJobs = await awsService.getFileFromS3();
    res.status(200).json(feedJobs);
  } catch (error) {
    console.error('Erro ao obter o feed de trabalhos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const addJob = async (req, res) => {
  const { company_id, title, description, location, notes, status } = req.body;

  try {
    const result = await pool.query('INSERT INTO jobs (company_id, title, description, location, notes, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [company_id, title, description, location, notes, status || 'draft']);
    res.status(201).json({ message: 'Emprego adicionado com sucesso.', data: result.rows[0] });
  } catch (error) {
    console.error('Erro ao adicionar emprego:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const updateJob = async (req, res) => {
  const job_id = req.params.id;
  const { title, description, location } = req.body;
  const updateFields = [];
  const params = [];
  let index = 1;

  const { rows: jobs } = await pool.query('SELECT status FROM jobs WHERE id = $1', [job_id]);

  if (jobs.length === 0) {
    return res.status(404).json({ error: 'Emprego não encontrado' });
  }

  const currentStatus = jobs[0].status;

  if (currentStatus !== StatusTypes.DRAFT) {
    return res.status(422).json({ error: 'Não é possível atualizar o emprego porque não está no status "draft"' });
  }

  if (title !== undefined) {
    updateFields.push(`title = $${index}`);
    params.push(title);
    index++;
  }

  if (description !== undefined) {
    updateFields.push(`description = $${index}`);
    params.push(description);
    index++;
  }

  if (location !== undefined) {
    updateFields.push(`location = $${index}`);
    params.push(location);
    index++;
  }

  params.push(job_id);

  const updateQuery = `UPDATE jobs
                       SET ${updateFields.join(', ')},
                           updated_at = NOW()
                       WHERE id = $${index} RETURNING *`;

  try {
    const result = await pool.query(updateQuery, params);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Emprego não encontrado' });
    } else {
      res.status(200).json({ message: 'Emprego atualizado com sucesso.', data: result.rows[0] });
    }
  } catch (error) {
    console.error('Erro ao atualizar emprego:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const publishJob = async (req, res) => {
  const job_id = req.params.id;

  try {
    const { rows: jobs } = await pool.query('SELECT status FROM jobs WHERE id = $1', [job_id]);

    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Emprego não encontrado' });
    }

    const currentStatus = jobs[0].status;

    if (currentStatus !== StatusTypes.DRAFT) {
      return res.status(422).json({ error: 'Não é possível publicar o emprego porque não está no status "draft"' });
    }

    await awsService.sendMessageToSQS(JSON.stringify({ job_id }));

    return res.status(200).json({ message: 'Emprego enfileirado com sucesso para publicação' });

  } catch (error) {
    console.error('Erro ao publicar emprego:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const archiveJob = async (req, res) => {
  const job_id = req.params.id;

  try {
    const { rows: jobs } = await pool.query('SELECT status FROM jobs WHERE id = $1', [job_id]);

    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Emprego não encontrado' });
    }

    const currentStatus = jobs[0].status;

    if (currentStatus !== StatusTypes.PUBLISHED) {
      return res.status(422).json({ error: 'Não é possível arquivar o emprego porque não está no status "published"' });
    }

    const { rowCount } = await pool.query('UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [StatusTypes.ARCHIVED, job_id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Emprego não encontrado' });
    }

    res.status(200).json({ message: 'Emprego arquivado com sucesso' });
  } catch (error) {
    console.error('Erro ao publicar emprego:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const deleteJob = async (req, res) => {
  const job_id = req.params.id;

  try {
    const { rows: jobs } = await pool.query('SELECT status FROM jobs WHERE id = $1', [job_id]);

    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Emprego não encontrado' });
    }

    const currentStatus = jobs[0].status;

    if (currentStatus !== StatusTypes.DRAFT) {
      return res.status(422).json({ error: 'Não é possível excluir o emprego porque não está no status "draft"' });
    }

    const { rowCount } = await pool.query('DELETE FROM jobs WHERE status = $1 AND id = $2 RETURNING *', [StatusTypes.DRAFT, job_id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Emprego não encontrado' });
    }

    res.status(200).json({ message: 'Emprego excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir emprego:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};


const deleteAllJobs = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM jobs WHERE status = $1 RETURNING *', [StatusTypes.DRAFT]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Nenhum rascunho de emprego encontrado para excluir' });
    } else {
      res.status(200).json({ message: 'Todos os rascunhos de emprego foram excluídos com sucesso' });
    }
  } catch (error) {
    console.error('Erro ao excluir todos os empregos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  getAllJobs, searchJobs, getJobById, getFeedJobs, addJob, updateJob, publishJob, archiveJob, deleteJob, deleteAllJobs,
};