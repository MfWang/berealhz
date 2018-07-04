// 没有用到
var express = require('express')
var webpack = require('webpack')
var webpackConfig = require('./webpack.dev')

var app = express();
// webpack编译器
var compiler = webpack(webpackConfig);

// webpack-dev-server中间件
var devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    stats: {
        colors: true,
        chunks: false
    }
});

app.use(devMiddleware)

// 路由
app.get('/', function(req, res, next) {
    var viewname = req.params.viewname 
        ? req.params.viewname + '.html' 
        : 'index.html';
        
    var filepath = path.join(compiler.outputPath, viewname);
    console.log(viewname)
    
    // 使用webpack提供的outputFileSystem
    compiler.outputFileSystem.readFile(filepath, function(err, result) {
        if (err) {
            // something error
            return next(err);
        }
        res.set('content-type', 'text/html');
        res.send(result);
        res.end();
    });
});

module.exports = app.listen(8888, function(err) {
    if (err) {
        // do something
        return;
    }
    
    console.log('Listening at http://localhost:' + 8888 + '\n')
})