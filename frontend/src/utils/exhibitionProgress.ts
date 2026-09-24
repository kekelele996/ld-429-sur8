import { ExhibitionStatus } from '../types/enums';
import type { Artwork, Exhibition } from '../types';

/** 仅进行中的展览记录参观进度，未开始 / 已结束展览只读浏览。 */
export const canTrackProgress = (exhibition?: Exhibition) => exhibition?.status === ExhibitionStatus.Active;

/** 按展览的展厅顺序（roomIds）拼接作品清单，同一展厅内保持作品原有顺序。 */
export const buildExhibitionArtworkList = (exhibition: Exhibition, artworks: Artwork[]): Artwork[] =>
  exhibition.roomIds.flatMap((roomId) => artworks.filter((artwork) => artwork.roomId === roomId));

/** 清单中第一件尚未看过的作品，即“接着看”的入口。 */
export const getNextArtwork = (orderedArtworks: Artwork[], viewedIds: string[]): Artwork | undefined =>
  orderedArtworks.find((artwork) => !viewedIds.includes(artwork.id));
