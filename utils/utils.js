module.exports = {
  successMsg: (data) => {
    return {
      code: 0,
      message: '',
      data: data || null,
    };
  },
  errorMsg: (message, data = null) => {
    return {
      code: -1,
      message: message || 'Error',
      data,
    };
  },
  getCurrentDate: () => {
    const date = new Date();
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    if (month < 10) {
      month = '0' + month;
    }
    let day = date.getDate();
    if (day < 10) {
      day = '0' + day;
    }
    const hours = date.getHours();
    const min = date.getMinutes();
    const seconds = date.getSeconds();
    return `${year}-${month}-${day} ${hours}:${min}:${seconds}`;
  },
  getCurrentDay: () => {
    const date = new Date();
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    if (month < 10) {
      month = '0' + month;
    }
    let day = date.getDate();
    if (day < 10) {
      day = '0' + day;
    }
    return `${year}-${month}-${day}`;
  },
};
