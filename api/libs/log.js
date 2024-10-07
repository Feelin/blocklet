module.exports = {
  logError: (err, req) => {
    console.error('API_ERROR:', err, `request params: ${req}`);
  }
}
