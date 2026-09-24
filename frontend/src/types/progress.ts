/**
 * 参观进度：按展览记录已看作品，持久化到本地存储，
 * 关闭并重开浏览器后仍可接着上次的顺序继续参观。
 */
export interface ExhibitionProgress {
  /** 所属展览 ID */
  exhibitionId: string;
  /** 已看作品 ID（去重，同一件重复打开不会增加数量） */
  viewedArtworkIds: string[];
  /** 最近一次更新时间（ISO 字符串） */
  updatedAt: string;
}

export type ProgressMap = Record<string, ExhibitionProgress>;
