const { successMsg } = require("../../utils/utils");
const { Controller } = require("egg");

class ConstantController extends Controller {
  async getClassiFication() {
    const { ctx } = this;
    const eid = ctx.user.eid; // 获取动态的 eid 值
    const query = `
      SELECT * FROM class_ification
      WHERE eid = ? 
      AND (is_delete = 0 OR is_delete IS NULL) ORDER BY \`order\` ASC;
      `;
    const classiFicationList = await this.app.mysql.query(query, [eid]);

    const buildTree = (items, parentId) => {
      const result = [];
      for (const item of items) {
        if (item.parentId === parentId) {
          const children = buildTree(items, item.id);
          if (children.length > 0) {
            item.children = children;
          }
          result.push(item);
        }
      }
      return result;
    };
    const topLevelItems = buildTree(classiFicationList, null);
    ctx.body = successMsg({
      list: topLevelItems,
    });
  }
}

module.exports = ConstantController;
