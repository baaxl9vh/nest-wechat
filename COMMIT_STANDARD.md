# COMMIT MESSAGE STANDARD

commit message 规范

```text
<type>: <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

提交 type 类型

+ ci: 改变CI配置文件和脚本
+ feat: 新增功能特性
+ fix: 修复BUG
+ docs: 添加修改文档
+ refactor: 代码重构重写
+ perf: 性能优化、体验优化
+ build: 改变影响项目npm run build脚本的代码、配置等
+ chore: 改变构通流程、添加依懒、添加工具等
+ revert: 回滚版本

提交单个文件

```shell
git commit path/to/file
```

提交所有变更文件

```shell
git commit .
```

不允许 git commit -m 'message to commit'

## Commit lint 配置

Install husky and init

```shell
npm install husky --save-dev
npx husky-init
```

Add commit message hook

```shell
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'
```

> [husky docs](https://typicode.github.io/husky/#/?id=usage)

Install commitlint & config-conventional

```shell
npm install --save-dev @commitlint/config-conventional @commitlint/cli
```

Configure commitlint to use conventional config

```shell
echo "module.exports = { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js
```

Test

```shell
npx commitlint --from HEAD~1 --to HEAD --verbose
```

> [commitlint docs](https://commitlint.js.org/#/guides-local-setup)