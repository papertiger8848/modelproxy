# demo 演示说明

* 第一步 

$ node basicUsageDemo.js


* 第二步

打开浏览器，访问 http://127.0.0.1:3000/index

* 第三步

打开浏览器控制台 查看输出结果

### 查看带cookie的请求及回写

* 第一步

sudo vim /etc/hosts
插入 127.0.0.1 local.taobao.com

* 第二步

访问 http://local.taobao.com:3000/getMyCart

* 第三步

打开浏览器控制台 查看networks选项卡中的 http请求细节(set-cookie)


### 查看post代理效果

* 第一步

$ node mockserver.js

* 第二步

$ node basicUsageDemo.js

* 第三步

打开浏览器，访问 http://127.0.0.1:3000/index
填写数据，点击按钮

