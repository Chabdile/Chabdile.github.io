class Dragon extends Enemy {
  // catchSight() {
  //   const shortestPath = this.pathfinder.findShortestPath({ x: this.x, y: this.y }, { x: this.target.x, y: this.target.y})
  //   const idealPath = this.pathfinder.findPath({ x: this.x, y: this.y }, { x: this.target.x, y: this.target.y})
    
  //   // 視界内にスライムを探す（スライムが近くにいるかチェック）
  //   for (let target of this.targetOther) {
  //     const dx = Math.abs(this.x - target.x)
  //     const dy = Math.abs(this.y - target.y)

  //     // スライムが視界範囲内にいる場合
  //     if (dx <= this.viewRange && dy <= this.viewRange) {
  //       this.target = slime   // スライムをターゲットに設定
  //       this.state = "detected"
  //       this.turnCounter = 0
  //       return true
  //     }
  //   }
    
  //   if (shortestPath.length <= this.viewRange && shortestPath.length === idealPath.length) {
  //     this.state = "detected"
  //     this.turnCounter = 0
  //     // this.target = player
  //     return true
  //   }
  //   return false
  // }
}

class Slime extends Enemy {
}