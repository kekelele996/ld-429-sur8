# 画廊虚拟导览平台

## 启动方式

```bash
cd frontend
npm install
npm run dev
```

访问地址：http://localhost:18809

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 前端 | React 18 + TypeScript + Vite |
| 3D | Three.js + @react-three/fiber + @react-three/drei + @react-three/rapier（可选碰撞层，移动控制已在 hook 中预留） |
| 状态管理 | Zustand |
| 本地存储 | Dexie.js / IndexedDB |
| 样式 | Tailwind CSS |
| 路由 | React Router v6 |

## 核心功能

- `/gallery`：3D 展厅漫游、作品信息卡片、导览标注、小地图。
- `/exhibitions`：展览列表，展示展览状态、策展人和封面；点击展览卡即选定该展进入漫游。
- `/artwork/:id`：作品大图查看、缩放和导览标注列表。
- `/editor`：展厅属性编辑、墙面颜色调整、作品移动到不同展厅。
- `/analytics`：参观在线状态、作品浏览排行、路线回放。

## 参观进度

- 从展览卡进入时会选定该展，并定位到该展的第一个展厅；作品清单按展厅参观顺序（`roomIds` 与挂载点顺序）生成，见 `src/utils/visitPlan.ts`。
- 在作品详情页和漫游信息卡打开作品即记录「已看」，同一件重复打开不增加数量；两处都会显示已看数量 / 总数与「下一件作品」。
- 漫游页侧边栏提供整场展览的分展厅作品清单，可就地切换作品；重开浏览器后进度、所选展览与展厅通过 localStorage 保留，可接着看。
- 未开始（Upcoming）与已结束（Past）的展览只允许浏览，不改变进度（`src/stores/visitProgressStore.ts`）。


## 目录结构

```text
frontend/src/
├── api/              # mockGallery.ts
├── stores/           # roomStore.ts, artworkStore.ts, exhibitionStore.ts, guideStore.ts, visitorStore.ts, themeStore.ts
├── types/            # room.ts, artwork.ts, exhibition.ts, guide.ts, visitor.ts, enums.ts, index.ts
├── components/common/  # ArtworkInfoCard, GuideTooltip, ExhibitionCard, MiniMap, PropertyPanel, StatusBadge, EmptyState
├── components/scene/   # GalleryScene, RoomBuilder, ArtworkMount, LightingSetup, NavigationController
├── hooks/            # useFirstPersonController.ts, useGalleryScene.ts, useVisitorTracking.ts
├── pages/            # GalleryWalk, ExhibitionList, ArtworkDetail, RoomEditor, Analytics
├── router/           # index.tsx
├── utils/            # threeUtils/, db.ts
├── constants/        # lighting.ts, frameStyles.ts
└── styles/           # theme.css, global.css
```

## 枚举位置

共享枚举统一位于 `frontend/src/types/enums.ts`，包含 `RoomType`、`ExhibitionStatus`、`FrameStyle` 和 `VisitorStatus`。

## License

MIT
