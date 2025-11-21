class Pathfinding {
  // 部屋と接続される通路の座標を取得
  getRoomConnections(room) {
    const connections = []
    for (let x = room.x - 1; x < room.x + room.w + 1; x++) {
      for (let y = room.y - 1; y < room.y + room.h + 1; y++) {
        if (this.isCorridor(x, y)) {
          connections.push({ x, y })
        }
      }
    }
    return connections
  }

  isCorridor(x, y) {
    const tile = map[y][x]
    return tile === '#' // 通路として判定する条件
  }

  findShortestPath(start, goal) {
    const queue = [[start]]
    const visited = new Set()
    visited.add(`${start.x},${start.y}`)

    while (queue.length > 0) {
      const path = queue.shift()
      const current = path[path.length - 1]

      if (current.x === goal.x && current.y === goal.y) {
        path.shift()
        return path
      }

      const directions = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: -1, y: -1 },
        { x: 1, y: -1 },
        { x: -1, y: 1 },
        { x: 1, y: 1 }
      ]

      for (const dir of directions) {
        const next = { x: current.x + dir.x, y: current.y + dir.y }
        if (
          this.isInBounds(next.x, next.y) &&
          !visited.has(`${next.x},${next.y}`)
        ) {
          visited.add(`${next.x},${next.y}`)
          queue.push([...path, next])
        }
      }
    }
    return null // 経路が見つからなかった場合
  }

  // BFSを使用して2点間の最短経路を計算
  findPath(start, goal) {
    const queue = [[start]]
    const visited = new Set()
    visited.add(`${start.x},${start.y}`)

    while (queue.length > 0) {
      const path = queue.shift()
      const current = path[path.length - 1]

      if (current.x === goal.x && current.y === goal.y) {
        path.shift()
        return path
      }

      const directions = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: -1, y: -1 },
        { x: 1, y: -1 },
        { x: -1, y: 1 },
        { x: 1, y: 1 },
        { x: 0, y: 0 }
      ]

      for (const dir of directions) {
        const next = { x: current.x + dir.x, y: current.y + dir.y }
        if (
          this.isInBounds(next.x, next.y) &&
          !visited.has(`${next.x},${next.y}`) &&
          this.canMove(next.x, next.y)
        ) {
          visited.add(`${next.x},${next.y}`)
          queue.push([...path, next])
        }
      }
    }
    return null // 経路が見つからなかった場合
  }

  isInBounds(x, y) {
    return y >= 0 && y < map.length && x >= 0 && x < map[0].length
  }

  canMove(x, y) {
    const tile = map[y][x]
    return !(tile === ',' || tile === 'O' || tile === ' ')
  }
}
