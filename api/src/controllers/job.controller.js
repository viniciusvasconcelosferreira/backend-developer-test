const { pool } = require('../../config/db.config');

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
  const { title, description, location, notes, status } = req.body;

  const updateFields = [];
  const params = [];
  let index = 1;

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

  if (notes !== undefined) {
    updateFields.push(`notes = $${index}`);
    params.push(notes);
    index++;
  }

  if (status !== undefined) {
    updateFields.push(`status = $${index}`);
    params.push(status);
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

const deleteJob = async (req, res) => {
  const job_id = req.params.id;

  try {
    const result = await pool.query('DELETE FROM jobs WHERE id = $1 RETURNING *', [job_id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Emprego não encontrado' });
    } else {
      res.status(200).json({ message: 'Emprego excluído com sucesso' });
    }
  } catch (error) {
    console.error('Erro ao excluir emprego:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};


const deleteAllJobs = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM jobs RETURNING *');

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Nenhum emprego encontrado para excluir' });
    } else {
      res.status(200).json({ message: 'Todos os empregos foram excluídos com sucesso' });
    }
  } catch (error) {
    console.error('Erro ao excluir todos os empregos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  getAllJobs, searchJobs, getJobById, addJob, updateJob, deleteJob, deleteAllJobs,
};