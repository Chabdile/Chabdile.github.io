class Dungeon {
  constructor(width, height, roomCount) {
    this.width = width
    this.height = height
    this.roomCount = roomCount
    this.map = Array.from({ length: height }, () => Array(width).fill(' '))
    this.rooms = []
  }

  generate() {
    this.createRooms()
    this.connectRooms()
    this.markNoItemZones()

    //redraw rooms
    for (let i = 0; i < this.roomCount; i++) {
      let room = this.rooms[i]
      this.fillRoom(room)
    }

    this.createObstacles()
  }

  createObstacles() {
    this.rooms.forEach((room) => {
      const obstacleCount = Math.floor((room.w * room.h) / 18); // 部屋面積の1/20%を障害物にする
      let placed = 0;

      while (placed < obstacleCount) {
        const x = Math.floor(Math.random() * (room.w - 2)) + room.x + 1; // 壁から1マス離れる
        const y = Math.floor(Math.random() * (room.h - 2)) + room.y + 1; // 壁から1マス離れる

        if (this.map[y][x] === '.') { // 部屋の床にのみ配置可能
          this.map[y][x] = 'O'; // 障害物を 'O' とする
          placed++;
        }
      }
    });
  }

  createRooms() {
    for (let i = 0; i < this.roomCount; i++) {
      let roomWidth = Math.floor(Math.random() * 12) + 3
      let roomHeight = Math.floor(Math.random() * 12) + 3
      let x = Math.floor(Math.random() * (this.width - roomWidth - 2)) + 1
      let y = Math.floor(Math.random() * (this.height - roomHeight - 2)) + 1
      let id = i

      const room = { x, y, w: roomWidth, h: roomHeight, id}
      if (!this.overlaps(room)) {
        this.rooms.push(room)
        this.fillRoom(room)
      } else {
        i--
      }
    }
  }

  overlaps(room) {
    return this.rooms.some(r =>
      !(room.x + room.w < r.x || r.x + r.w < room.x || room.y + room.h < r.y || r.y + r.h < room.y)
    )
  }

  fillRoom(room) {
    for (let y = room.y; y < room.y + room.h; y++) {
      for (let x = room.x; x < room.x + room.w; x++) {
        this.map[y][x] = '.'
      }
    }
  }

  connectRooms() {
    const startPoint = [this.rooms[0]]
    const endPoint = [...this.rooms.slice(1)]

    while (endPoint.length) {
      const roomA = startPoint[Math.floor(Math.random() * startPoint.length)]
      const roomB = endPoint.shift()

      const [x1, y1] = [roomA.x + Math.floor(Math.abs((Math.random() + 1) * roomA.w / 2)), roomA.y + Math.floor(Math.abs((Math.random() - 1) * roomA.h / 2))]
      const [x2, y2] = [roomB.x + Math.floor(Math.abs((Math.random() - 1) * roomB.w / 2)), roomB.y + Math.floor(Math.abs((Math.random() + 1) * roomB.h / 2))]

      this.drawCorridor(x1, y1, x2, y2)
      startPoint.push(roomB)
    }
  }

  drawCorridor(x1, y1, x2, y2) {
    if (Math.random() > 0.5) {
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) this.map[y1][x] = '#'
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) this.map[y][x2] = '#'
    } else {
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) this.map[y][x1] = '#'
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) this.map[y2][x] = '#'
    }
  }

  markNoItemZones() {
    this.map.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === '.' || cell === '#') {
          this.markSurroundingCells(x, y)
        }
      })
    })
  }

  markSurroundingCells(x, y) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy
        if (this.inBounds(nx, ny) && this.map[ny][nx] === ' ') {
          this.map[ny][nx] = ','
        }
      }
    }
  }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height
  }

  render() {
    return this.map.map(row => row.join('')).join('\n')
  }
}

const dungeon = new Dungeon(40, 40, Math.floor(Math.random() * 3) + 4)
dungeon.generate()
// マップデータ例
let map = dungeon.render().split("\n").map(line => line.split(''))
// document.getElementById('dungeon').innerHTML = `<pre>${dungeon.render()}</pre>`