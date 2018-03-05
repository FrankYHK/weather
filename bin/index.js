#!/usr/bin/env node
'use strict';

var chalk = require('chalk');
var commander = require('commander');
var packageJson = require('../package.json');
var axios = require('axios');
var log = console.log;

var program = require('commander');
program.version(packageJson.version)
.option('-n, --now', '查询实况天气')
.option('-f, --future', '查询未来3天天气')
.parse(process.argv);


var defaultCity = '';
getDefaultCity();

//获取当前ip所在的城市
function getDefaultCity(){
    axios.get('http://pv.sohu.com/cityjson?ie=utf-8&format=json',{responseType: 'json'})
    .then(function(res){
        axios.get('http://int.dpool.sina.com.cn/iplookup/iplookup.php',{
            params: {
                format: 'json',
                ip: res.data[0].cip
            }
        }).then(function(response){
            defaultCity = response.data.city;
            handle();
        }).catch(function(error){
            log(chalk.red(error))
        })
    }).catch(function(err){
        log(chalk.red(err))
    })
}
function handle(){
    if (program.now){
        axios.get('https://free-api.heweather.com/s6/weather/now?parameters', {
            params: {
                location: process.argv[3] ? process.argv[3] : defaultCity,
                key: '3a8725771f9a4c34ad27a68bd9cba1d4'
            }
        })
        .then(function (response) {
            
            if (response.data.HeWeather6[0].basic) {
                log(chalk.green('实况天气预报－－－－－－－－－－－－－－－－－－start'))
                log(chalk.blue(`地区： ${response.data.HeWeather6[0].basic.admin_area}/${response.data.HeWeather6[0].basic.location}`));
                log(chalk.blue(`更新时间： ${response.data.HeWeather6[0].update.loc}`));
                log(chalk.yellow(`温度： ${response.data.HeWeather6[0].now.tmp} ／ 体感温度： ${response.data.HeWeather6[0].now.tmp}`));
                log(chalk.yellow(`天气状况： ${response.data.HeWeather6[0].now.cond_txt}`));
                log(chalk.yellow(`风向： ${response.data.HeWeather6[0].now.wind_dir} ／ 风力： ${response.data.HeWeather6[0].now.wind_sc}级`));
                log(chalk.green('实况天气预报－－－－－－－－－－－－－－－－－－end'))
            } else if(response.data.HeWeather6[0].status === "unknown city"){
                log(chalk.red('未知城市区域，请输入正确的城市名    格式 f-weather -n [城市名]'))
            }
        })
        .catch(function (error) {
            log(chalk.red(error));
        });
    }else if (program.future) {
        axios.get('https://free-api.heweather.com/s6/weather/forecast?parameters', {
            params: {
                location: process.argv[3] ? process.argv[3] : defaultCity,
                key: '3a8725771f9a4c34ad27a68bd9cba1d4'
            }
        })
        .then(function (response) {
            
            if (response.data.HeWeather6[0].basic) {
                log(chalk.green('未来3天预报－－－－－－－－－－－－－－－－－－start'))
                log(chalk.blue(`地区： ${response.data.HeWeather6[0].basic.admin_area}/${response.data.HeWeather6[0].basic.location}`));
                var data = response.data.HeWeather6[0].daily_forecast;
                for (let index = 0; index < data.length; index++) {
                    log();
                    log(chalk.yellow(`${data[index].date}`));
                    log(chalk.yellow(`白天天气状况： ${data[index].cond_txt_d}`));
                    log(chalk.yellow(`夜间天气状况： ${data[index].cond_txt_n}`));
                    log(chalk.yellow(`风向： ${data[index].wind_dir} ／ 风力： ${data[index].wind_sc}级`));
                    log(chalk.yellow(`紫外线强度指数:  ${data[index].uv_index}`))
                }
                

                log(chalk.green('未来3天预报－－－－－－－－－－－－－－－－－－end'))
            } else if(response.data.HeWeather6[0].status === "unknown city"){
                log(chalk.red('未知城市区域，请输入正确的城市名    格式 f-weather -f [城市名]'))
            }
        })
        .catch(function (error) {
            log(chalk.red(error));
        });
    }
}