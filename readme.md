
## 环境搭建
* 安装 jdk 8+
* 安装 maven 3+
* 安装 [GateOne](http://liftoff.github.io/GateOne/About/index.html)

## 修改配置
* 修改`vis\src\main\resources\application.yml`里面的配置文件，如下：
```
# custom properties
app:
  # GateOne 部署的地址
  gateoneUrl: https://222.20.79.232:10598/


# web app 端口
server:
  port: 8080

# socket监听的端口
netty:
  server:
    port: 3333

spring:
  # 数据库配置
  datasource:
    url: jdbc:mysql://localhost:3306/vis?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=CTT
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver
```


## 运行方式
### 第一种：打包成jar包运行
1.进入vis项目的根目录，然后运行`mvn package`命令把工程打包成jar；
```cmd
vis\: mvn package
```
2.运行jar包：maven默认打包在target目录，进入vis\target目录，然后运行`java -jar vis.jar`
```cmd
vis\target\: java -jar visualization-x.x.x.jar
```

### 第二种：使用maven运行
进入vis项目的根目录，然后运行`mvn spring-boot:run`命令。
```cmd
vis\: mvn spring-boot:run
```

