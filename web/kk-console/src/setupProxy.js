const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function(app) {
    app.use(
        '/api',
        createProxyMiddleware( {
            target: 'https://139.198.112.218:30880',
            changeOrigin: true,
            // pathRewrite: {'^/api': ''}
            secure: false
        })
    )
}
