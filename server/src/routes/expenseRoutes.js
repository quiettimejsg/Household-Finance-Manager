const dayjs = require('dayjs');
const express = require('express');
const router = express.Router();
const { getExpenses, addExpense, getCsvPath } = require('../controllers/expenses');

const fs = require('fs');
const path = require('path');
const csvFilePath = path.join(__dirname, '../../exports/expenses_initial.csv');

/**
 * @api {get} /api/expenses 获取所有消费记录
 * @apiName GetExpenses
 * @apiGroup Expenses
 * @apiSuccess {Object[]} expenses 消费记录数组
 */
router.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await getExpenses();
    res.json(expenses);
  } catch (error) {
    console.error('获取消费记录失败:', error);
    res.status(500).json({ error: '获取消费记录失败', message: error.message });
  }
});

/**
 * @api {post} /api/expenses 添加新消费记录
 * @apiName AddExpense
 * @apiGroup Expenses
 * @apiParam {string} type 消费类型
 * @apiParam {string} remark 消费项目名称
 * @apiParam {number} amount 消费金额
 * @apiParam {string} time 消费时间（ISO格式）
 * @apiSuccess {string} message 操作成功提示
 */
router.post('/api/expenses', (req, res, next) => {
  try {
    // 验证金额
    if (req.body.amount === undefined) {
      throw new Error('金额不能为空');
    }
    const amount = parseFloat(req.body.amount);
    if (isNaN(amount)) {
      throw new Error('金额必须是有效的数字');
    }
    req.body.amount = amount;
    
    // 验证时间
    if (req.body.time && !dayjs(req.body.time).isValid()) {
      throw new Error('时间格式无效，请使用有效的日期格式');
    }
    req.body.time = dayjs(req.body.time).isValid() 
      ? dayjs(req.body.time).format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD');
    
    next();
  } catch (e) {
    res.status(400).json({ error: '数据格式错误: ' + e.message });
  }
}, addExpense);

/**
 * @api {get} /api/expenses/csv 获取最新CSV文件路径
 * @apiName GetCsv
 * @apiGroup Expenses
 * @apiSuccess {string} path CSV文件路径
 */
router.get('/api/expenses/csv', getCsvPath);



router.get('/api/expenses/csv/raw', (req, res) => {
  if (!fs.existsSync(csvFilePath)) {
    return res.status(404).json({ error: 'CSV文件尚未生成' });
  }
  fs.readFile(csvFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('读取CSV文件失败:', err);
      return res.status(500).json({ error: '无法读取CSV文件' });
    }
    res.type('text/csv').send(data);
  });
});

module.exports = router;