const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

class ExportService {
  constructor(db) {
    this.db = db;
  }

  // 获取完整消费数据（异步方法）
  async getFullData() {
    return await this.db.getExpenses(); // 使用数据库提供的getExpenses方法获取数据
  }

  // 生成CSV文件（异步方法）
  async generateCSV() {
    const data = await this.getFullData(); // 等待数据获取完成
    const escapeQuotes = (str) => String(str).replace(/"/g, '\"');
    const csvContent = [
      '"类型","备注","金额","日期"',
      ...data.map(item => `"${escapeQuotes(item.type)}","${escapeQuotes(item.remark || '')}","${escapeQuotes(item.amount)}","${escapeQuotes(item.time)}"`)
    ].join('\n');
    
    const exportDir = path.join(__dirname, '../../exports/');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true }); // 确保导出目录存在
    }
    const filePath = path.join(exportDir, `expenses_${Date.now()}.csv`);
    fs.writeFileSync(filePath, csvContent);
    return filePath;
  }

  // 生成Excel文件
  generateExcel() {
    const data = this.getFullData();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '消费记录');
    
    const filePath = path.join(__dirname, '../../exports/', `expenses_${Date.now()}.xlsx`);
    XLSX.writeFile(workbook, filePath);
    return filePath;
  }
}

module.exports = ExportService;