import type { Artwork, Exhibition, GalleryRoom } from '../types';

/** 参观路线上的一件作品（清单中的一个节点） */
export interface VisitStop {
  /** 该作品在整场展览中的序号，从 1 开始 */
  order: number;
  artwork: Artwork;
  room: GalleryRoom;
}

/** 按展厅分组的参观清单 */
export interface VisitGroup {
  room: GalleryRoom;
  /** 该展厅在展览参观顺序中的序号，从 1 开始 */
  roomOrder: number;
  stops: VisitStop[];
}

const samePosition = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) =>
  a.x === b.x && a.y === b.y && a.z === b.z;

/**
 * 依据展览的展厅参观顺序生成作品清单：
 * 先按 roomIds 的先后排列展厅，厅内作品按挂载点顺序排列；
 * 无法对应到挂载点的作品按原始数据顺序排在该厅末尾。
 * 不属于展览任何展厅的作品不会出现在清单里。
 */
export function buildVisitStops(exhibition: Exhibition, rooms: GalleryRoom[], artworks: Artwork[]): VisitStop[] {
  const stops: VisitStop[] = [];
  let order = 1;
  for (const roomId of exhibition.roomIds) {
    const room = rooms.find((item) => item.id === roomId);
    if (!room) continue;
    const roomArtworks = artworks.filter((artwork) => artwork.roomId === room.id);
    const mounted: Artwork[] = [];
    const unmatched: Artwork[] = [];
    for (const artwork of roomArtworks) {
      const mountIndex = room.mountPoints.findIndex((point) => samePosition(point.position, artwork.mountPosition));
      if (mountIndex >= 0) mounted.push(artwork);
      else unmatched.push(artwork);
    }
    mounted.sort((a, b) => {
      const ai = room.mountPoints.findIndex((point) => samePosition(point.position, a.mountPosition));
      const bi = room.mountPoints.findIndex((point) => samePosition(point.position, b.mountPosition));
      return ai - bi;
    });
    for (const artwork of [...mounted, ...unmatched]) {
      stops.push({ order: order++, artwork, room });
    }
  }
  return stops;
}

/** 将线性作品清单按展厅折叠成分组（保持展厅参观顺序） */
export function groupVisitStops(stops: VisitStop[]): VisitGroup[] {
  const groups: VisitGroup[] = [];
  for (const stop of stops) {
    let group = groups.find((item) => item.room.id === stop.room.id);
    if (!group) {
      group = { room: stop.room, roomOrder: groups.length + 1, stops: [] };
      groups.push(group);
    }
    group.stops.push(stop);
  }
  return groups;
}

/**
 * 返回当前作品之后的下一件作品：
 * 优先取路线中紧邻的下一件；若当前作品不在清单中，则从清单开头开始。
 */
export function getNextStop(stops: VisitStop[], currentArtworkId?: string): VisitStop | undefined {
  if (stops.length === 0) return undefined;
  const currentIndex = stops.findIndex((stop) => stop.artwork.id === currentArtworkId);
  if (currentIndex < 0 || currentIndex === stops.length - 1) {
    return currentIndex < 0 ? stops[0] : undefined;
  }
  return stops[currentIndex + 1];
}
