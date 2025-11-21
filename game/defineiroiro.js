let count = 0 //turn count
let room = [[],[],[],[],[]]
// let stairs = []
// let dragon = []
// let enemies = []
for (i = 0; i < dungeon.roomCount; i++) {
  room[i] = dungeon.rooms[Math.floor(Math.random() * dungeon.roomCount)]
  // stairs = [room[1].x + Math.floor(Math.random() * room[1].w), room[1].y + Math.floor(Math.random() * room[1].h)]
  // dragon = [room[2].x + Math.floor(Math.random() * room[2].w), room[2].y + Math.floor(Math.random() * room[2].h)]
  // enemies[i] = [room[i].x + Math.floor(Math.random() * room[i].w), room[i].y + Math.floor(Math.random() * room[i].h)]
}

class Player {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}
const player = new Player(
  room[0].x + Math.floor(Math.random() * room[0].w),
  room[0].y + Math.floor(Math.random() * room[0].h)
)
const dragon = new Dragon(
  room[1].x + Math.floor(Math.random() * room[1].w),
  room[1].y + Math.floor(Math.random() * room[1].h),
  map
) // ドラゴンの初期位置
dragon.target = player

const slime = new Slime(
  room[2].x + Math.floor(Math.random() * room[2].w),
  room[2].y + Math.floor(Math.random() * room[2].h),
  map
) // ドラゴンの初期位置
slime.target = dragon



const stairs = {
  x: room[2].x + Math.floor(Math.random() * room[2].w),
  y: room[2].y + Math.floor(Math.random() * room[2].h)
} // 階段の位置