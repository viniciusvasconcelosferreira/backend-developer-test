const { pool } = require('../../config/db.config');

const getAllCompanies = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao obter empresas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const searchCompanies = async (req, res) => {
  const searchQuery = req.query.q;

  try {
    const result = await pool.query('SELECT * FROM companies WHERE name ILIKE $1', [`%${searchQuery}%`]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getCompanyById = async (req, res) => {
  const company_id = req.params.id;

  try {
    const result = await pool.query('SELECT * FROM companies WHERE id = $1', [company_id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Empresa não encontrada' });
    } else {
      res.status(200).json({ message: 'Empresa encontrada com sucesso', data: result.rows[0] });
    }
  } catch (error) {
    console.error('Erro ao obter empresa por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const addCompany = async (req, res) => {
  const { name } = req.body;

  try {
    const result = await pool.query('INSERT INTO companies (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json({ message: 'Empresa adicionada com sucesso.', data: result.rows[0] });
  } catch (error) {
    console.error('Erro ao adicionar empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const updateCompany = async (req, res) => {
  const company_id = req.params.id;
  const { name } = req.body;

  const updateFields = [];
  const params = [];
  let index = 1;

  if (name !== undefined) {
    updateFields.push(`name = $${index}`);
    params.push(name);
    index++;
  }

  params.push(company_id);

  const updateQuery = `UPDATE companies
                       SET ${updateFields.join(', ')},
                           updated_at = NOW()
                       WHERE id = $${index} RETURNING *`;

  try {
    const result = await pool.query(updateQuery, params);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Empresa não encontrada' });
    } else {
      res.status(200).json({ message: 'Empresa atualizada com sucesso.', data: result.rows[0] });
    }
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const deleteCompany = async (req, res) => {
  const company_id = req.params.id;

  try {
    const result = await pool.query('DELETE FROM companies WHERE id = $1 RETURNING *', [company_id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Empresa não encontrada' });
    } else {
      res.status(200).json({ message: 'Empresa excluída com sucesso' });
    }
  } catch (error) {
    console.error('Erro ao excluir empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};


const deleteAllCompanies = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM companies RETURNING *');

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Nenhuma empresa encontrada para excluir' });
    } else {
      res.status(200).json({ message: 'Todas as empresas foram excluídas com sucesso' });
    }
  } catch (error) {
    console.error('Erro ao excluir todas as empresas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  getAllCompanies, searchCompanies, getCompanyById, addCompany, updateCompany, deleteCompany, deleteAllCompanies,
};