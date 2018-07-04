const path = require("path")
const uglify = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextWebapckPlugin = require('extract-text-webpack-plugin');
var website ={
    publicPath:"http://localhost:8888/"
    // publicPath:"http://192.168.1.103:8888/"
}
const glob = require('glob');
const PurifyCSSPlugin = require("purifycss-webpack");

var getEntry = function(globPath, pathDir) {
    var files = glob.sync(globPath);
    var entries = {},
        entry, dirname, basename, pathname, extname;

    for (var i = 0; i < files.length; i++) {
        entry = files[i];
        dirname = path.dirname(entry);   //文件目录
        extname = path.extname(entry);   //后缀名
        basename = path.basename(entry, extname);  //文件名
        pathname = path.join(dirname, basename);
        pathname = pathDir ? pathname.replace(new RegExp('^' + pathDir), '') : pathname;
        entries[pathname] = ['./' + entry]; //这是在osx系统下这样写  win7  entries[basename]
    }
    // console.log(entries);
    return entries;
}
//入口(通过getEntry方法得到所有的页面入口文件)
var entries = getEntry('dev/**/*.js', 'dev/');

console.log(entries)

module.exports = {
    mode: 'development',
    // 入口文件配置
    entry: entries,
    // 出口文件配置
    output: {
        path: path.resolve(__dirname, '../build'),
        filename: '[name].js',
        publicPath:website.publicPath  //publicPath：主要作用就是处理静态文件路径的。
    },
    // 模块：例如解读css，图片如何转换、压缩
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ExtractTextWebapckPlugin.extract({
                    fallback: "style-loader",
                    use: ['css-loader','postcss-loader','sass-loader']
                }),
                // use: [
                //     {loader: "style-loader"},
                //     {loader: "css-loader"},
                //     {loader: "sass-loader"}
                // ],
                include: path.join(__dirname, '../dev'), //限制范围，提高打包速度
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ExtractTextWebapckPlugin.extract({
                    fallback: "style-loader",
                    use: ['css-loader','postcss-loader']
                }),
                // use: [
                //     {loader: "style-loader"},
                //     {loader: "css-loader"}
                // ],
                include: path.join(__dirname, '../dev'), //限制范围，提高打包速度
                exclude: /node_modules/
            },
            {
                test:/\.(png|jpg|gif|jpeg)/,  //是匹配图片文件后缀名称
                use:[{
                    loader:'url-loader', //是指定使用的loader和loader的配置参数
                    options:{
                        limit:500,  //是把小于500B的文件打成Base64的格式，写入JS
                        outputPath: 'images/'
                    }
                }]
            },
            {
                test: /\.(htm|html)$/i,
                use:[ 'html-withimg-loader'] 
            },
            {
                test:/\.(jsx|js)$/,
                use:{
                    loader:'babel-loader'
                },
                exclude:/node_modules/
            }
        ]
    },
    // 插件，用于生产模版和各项功能
    plugins: [
        new uglify(),
        // new htmlPlugin({
        //     minify:true,
        //     hash:true, //为了开发中js有缓存效果，所以加入hash，这样可以有效避免缓存JS。
        //     template:'../dev/index.html' //是要打包的html模版路径和文件名称。
        // })
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname,'../dev/home','index.html'),
            // template:'./dev/home/index.html',
            filename:'index.html',
            chunks: ['index'],
            hash:true,//防止缓存
            minify:{
                removeAttributeQuotes:true//压缩 去掉引号
            }
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname,'../dev/account','index.html'),
            // template:'./dev/home/index.html',
            filename:'account.html',
            chunks: ['info'],
            hash:true,//防止缓存
            minify:{
                removeAttributeQuotes:true//压缩 去掉引号
            }
        }),
        new ExtractTextWebapckPlugin("css/[name].css"),
        // new PurifyCSSPlugin({ 
        //     //这里配置了一个paths，主要是需找html模板，purifycss根据这个配置会遍历你的文件，查找哪些css被使用了。
        //     paths: glob.sync(path.join(__dirname, './dev/*.html')),
        // }),
    ],
    // 配置webpack开发服务功能
    devServer: {
        contentBase: path.resolve(__dirname, '../build'),
        host: 'localhost',
        compress: true,
        port: 8888
    }
}