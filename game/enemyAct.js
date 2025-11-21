class Enemy {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.state = "searching" // 状態: "unnoticed", "searching", "detected"
    this.target = null
    this.targetOther = []
    this.viewRange = 4
    this.path = [] // 次の行動のための経路
    this.pathfinder = new Pathfinding
    this.searchTurns = 5 // searching状態で行動するターン数
    this.turnCounter = 0 // 状態維持のカウンタ
  }

  act() {
    switch (this.state) {
      case "unnoticed":
        // 部屋内を巡回、次の通路に向かう   
        this.patrol()


        // if (!this.target || (this.x === this.target.x && this.y === this.target.y)) {
        //   // 次のターゲットを設定
        // }
        if (this.detectTarget()) {
          this.state = "detected"
          this.turnCounter = 0
          // this.target = player
          this.path = []
        }
        break
  
      case "searching":
        if (this.detectTarget()) {
          this.state = "detected"
          this.turnCounter = 0
          // this.target = player
          this.path = []
        } else {
          if (this.path.length === 0) {
            this.wander()
          } else {
            this.followPath()
          }
        }

        this.turnCounter++
        
        if (this.turnCounter === this.searchTurns) {
          this.state = 'unnoticed'
          this.turnCounter = 0
          // this.target = null
        }
        break
  
      case "detected":
        this.moveToTarget()
        break
    }
  }
  
  
  patrol() {
    if (this.path.length <= 1) {
      //search path
      const currentRoom = this.getRoom()
      if (currentRoom) {
        //room
        const connections = this.pathfinder.getRoomConnections(currentRoom)
        if (connections.length > 0) {
          const goal = connections[Math.floor(Math.random() * connections.length)]
          // console.log('inroom = '+ goal.x + ', ' + goal.y)
          
          this.path = this.pathfinder.findPath({ x: this.x, y: this.y }, goal)
        } else if (connections.length === 1) {
          for (let i = 0; i < 10; i++) {
            this.wander()
          }
        }
      } else {
        //corridor
        const room = dungeon.rooms[Math.floor(Math.random() * dungeon.roomCount)]
        const connections = this.pathfinder.getRoomConnections(room)
        
        if (connections.length > 0) {
          const goal = connections[Math.floor(Math.random() * connections.length)]
          // console.log('tonextroom = '+ goal.x + ', ' + goal.y )
          
          this.path = this.pathfinder.findPath({ x: this.x, y: this.y }, goal)
        }
      }
    } else {
    }
    this.followPath()
  }
  
  moveToTarget() {
    const shortestPath = this.pathfinder.findShortestPath({ x: this.x, y: this.y }, { x: this.target.x, y: this.target.y})
    // const idealPath = this.pathfinder.findPath({ x: this.x, y: this.y }, { x: this.target.x, y: this.target.y})
    // console.log("shortest: "+shortestPath.length + ", ideal: " + idealPath.length)

    if (!this.target || shortestPath.length > this.viewRange) {
      this.state = 'searching'
      this.turnCounter = 0
      // this.target = null
    }
    if (this.path.length === 0) {
      const goal = { x: 0, y: 0 }
      goal.x = this.target.x + Math.floor(Math.random() * 1.6) - 1
      goal.y = this.target.y + Math.floor(Math.random() * 1.6) - 1
      this.path = this.pathfinder.findPath({ x: this.x, y: this.y }, goal)
      // console.log(this.path[0])
    }
    // console.log("move: " + this.path[0])
    this.followPath()
  }

  detectTarget() {
    const dx = Math.abs(this.x - this.target.x)
    const dy = Math.abs(this.y - this.target.y)
    if (dx <= this.viewRange && dy <= this.viewRange) {
      return this.catchSight()
    }
    return false
  }
  
  catchSight() {
    const shortestPath = this.pathfinder.findShortestPath({ x: this.x, y: this.y }, { x: this.target.x, y: this.target.y})
    const idealPath = this.pathfinder.findPath({ x: this.x, y: this.y }, { x: this.target.x, y: this.target.y})
    if (shortestPath.length <= this.viewRange && shortestPath.length === idealPath.length) {
      this.state = "detected"
      this.turnCounter = 0
      // this.target = player
      return true
    }
    return false
  }

  followPath() {
    if (this.path === null) this.path = []
    if (this.path.length > 0) {
      const next = this.path.shift()
      if (this.canMove(next.x, next.y)) {
        this.x = next.x
        this.y = next.y
      }
    }
  }
  
  wander() {
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
    const randomDir = directions[Math.floor(Math.random() * directions.length)]
    const newX = this.x + randomDir.x
    const newY = this.y + randomDir.y
    if (this.canMove(newX, newY)) {
      this.path.push({x: newX, y: newY})
    }
  }

  canMove(x, y) {
    const tile = map[y][x]
    return !(tile === ',' || tile === 'O' || tile === ' ' || tile === 'S' || tile === 'D')
  }

  getRoom() {
    let currentRoom = null
    dungeon.rooms.forEach((room) => {
      if (
        this.x >= room.x &&
        this.x < room.x + room.w &&
        this.y >= room.y &&
        this.y < room.y + room.h
      ) {
        currentRoom = room
      }
    })
    return currentRoom
  }

}
