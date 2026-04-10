# Blackboard

一个基于 Spring Boot 的电子画板小项目，适合小朋友涂鸦和保存作品。

## 功能特性

- 电子画板自由绘制（支持画笔、橡皮擦、线条粗细、颜色）
- 导出 PNG 图片
- 保存作品到后端内存
- 查看历史画册（名称、缩略图、保存时间）
- 温馨可爱风 UI 与动效弹窗
- 保存成功会给小朋友鼓励提示

## 技术栈

- Java 17+
- Spring Boot 3
- 原生 HTML / CSS / JavaScript

## 本地运行

### 1) 克隆项目

```bash
git clone https://github.com/wriiiii/blackboard.git
cd blackboard
```

### 2) 启动服务

如果你的环境已配置好 `mvn`：

```bash
mvn spring-boot:run
```

如果你使用本机 Maven 脚本（与当前开发环境一致）：

```bash
JAVA_HOME="/Users/wr/project/oracleJdk-21.jdk/Contents/Home" \
"/Users/wr/.cursor/extensions/oracle.oracle-java-25.0.1-universal/nbcode/java/maven/bin/mvn.sh" spring-boot:run
```

### 3) 访问页面

打开浏览器访问：

`http://localhost:8080`

## API 说明

### 保存作品

- `POST /api/artworks`
- 请求体：

```json
{
  "name": "彩虹小城堡",
  "imageDataUrl": "data:image/png;base64,..."
}
```

### 查询历史画册

- `GET /api/artworks`

## 注意事项

- 历史画册当前使用**内存存储**，服务重启后会清空。
