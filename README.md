# 每日 AI 数码简报

每天自动抓取中文科技媒体的 RSS，按日期归档成 JSON，用一个静态网页展示。不需要服务器，不花钱，全部跑在 GitHub 上。

## 部署步骤（约 10 分钟）

1. 在 GitHub 新建一个仓库（公开或私有都行；私有仓库用 Pages 需要付费账号，建议先用公开仓库）。
2. 把本文件夹里的所有文件上传到仓库根目录，注意要包含隐藏文件夹 `.github`。
3. 打开仓库的 **Settings → Actions → General**，在 *Workflow permissions* 选 **Read and write permissions**，保存。
4. 打开 **Actions** 页面，选择“每日更新新闻”，点 **Run workflow** 手动运行一次，等它变绿。运行后仓库里会多出 `data/日期.json` 文件。
5. 打开 **Settings → Pages**，Source 选 **Deploy from a branch**，分支选 `main`，目录选 `/ (root)`，保存。
6. 几分钟后访问 `https://你的用户名.github.io/仓库名/` 就能看到页面。

之后每天北京时间早上 6 点左右会自动更新。想改时间，编辑 `.github/workflows/update.yml` 里的 cron（使用 UTC 时间）。

## 开启 AI 中文摘要（可选）

每条新闻会多一句 40 到 70 字的中文摘要，页面上带“AI 摘要”标记。不开启也能正常使用，只是显示原站的摘录。

1. 到 Anthropic 控制台创建一个 API Key。
2. 在仓库 **Settings → Secrets and variables → Actions → New repository secret**，名称填 `ANTHROPIC_API_KEY`，值填你的 Key。
3. 之后每次自动更新都会给最近 3 天还没有摘要的新闻补上，每次最多处理 60 条，已经生成的不会重复生成。

注意：
- 这会产生 API 费用，费用取决于新闻数量和所选模型。想控制花费可以调小环境变量 `SUMMARY_MAX`（在 `update.yml` 的 env 里加）。
- 默认模型是 `claude-haiku-5-5`，想换模型就设置环境变量 `AI_MODEL`。我没法在开发环境里联网验证这个模型名，第一次运行请看日志是否出现 `[fail]`。
- 摘要只依据标题和 RSS 里的摘录生成，没有读取全文，所以信息少的新闻摘要会比较简短，重要内容请以原文为准。
- 如果不想把密钥放在 GitHub，也可以不开启这个功能。

## 常用修改

- **新闻来源**：编辑 `scripts/feeds.json`。`filter: true` 表示这个来源综合内容多，只保留命中 `tech_keywords` 的文章。
- **分类规则**：同一个文件的 `categories`，按从上到下的顺序匹配，都不命中归为“行业动态”。
- **GitHub 推荐**：编辑 `data/github_pool.json`，每天按日期轮换 3 个，轮完自动重复。
- **保留天数**：抓取时只收最近 `max_age_days` 天的文章，历史归档不会被删除。

## 本地预览

```bash
python scripts/fetch_news.py     # 抓取一次（需要能访问各来源网站）
python -m http.server 8000       # 然后打开 http://localhost:8000
```
直接双击打开 index.html 不行，浏览器会拦截读取 JSON，必须用本地服务器。

## 需要注意

- `feeds.json` 里的 RSS 地址是按各站常见地址填写的，**我没法在开发环境里联网验证**。第一次运行后，请在 Actions 的运行日志里查看每个来源是 `[ok]` 还是 `[fail]`。个别来源失败不影响其他来源；如果某个地址失效，去该网站找到最新的 RSS 地址替换即可。
- 页面只展示标题、前 110 字摘要和原站配图链接，点击跳转到原文。配图是直接引用原站图片，原站不允许外链时会自动换成按分类生成的插图。
- 收藏和已读保存在访问者自己浏览器的 localStorage 里，换设备不会同步（没有登录系统）。
- GitHub 如果发现仓库 60 天没有任何活动，可能会暂停定时任务，到 Actions 页面点一下重新启用即可。
