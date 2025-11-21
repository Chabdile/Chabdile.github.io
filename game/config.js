document.addEventListener('keydown', config)

function config(e){
  let newPos = { x: player.x, y: player.y }
  // console.log(e)

  // 画面外に出ない
  if (
    newPos.x - 1 >= 0 && newPos.x + 1 < dungeon.width &&
    newPos.y - 1 >= 0 && newPos.y + 1 < dungeon.height
  ) {
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
    function updatePos(n) {
      newPos.x += directions[n].x
      newPos.y += directions[n].y
            
      //壁を貫通しない
      const tile = map[newPos.y][newPos.x]
      if (!(tile === ',' || tile === 'O' || tile === ' ')) {
        //update
        //移動前にタイルをオリジナルで上書き
        map = dungeon.render().split("\n").map(line => line.split(''))
        player.x = newPos.x
        player.y = newPos.y
        updateMap()
        if (player.x === stairs.x && player.y === stairs.y) {
          if (dragon.state == 'detected' && dragon.target == player) {
            document.removeEventListener('keydown', config)
            const textBox = document.getElementById("text")
            textBox.innerHTML = "Congratulations!\n You succeed in pulling the menace apart from town!"
          }
        }
        if (player.x === dragon.x && player.y === dragon.y) {
          document.removeEventListener('keydown', config)
          const textBox = document.getElementById("text")
          textBox.innerHTML = "retry...(3s later)"
          setTimeout(() => {
            location.reload()
          }, 3000);
        }
        // console.log("turn: " + count)
      }
    }

    if (e.shiftKey === true) {
      switch (e.key) {
        case 'ArrowUp':
          updatePos(5)
          break
        case 'ArrowDown':
          updatePos(6)
          break
        case 'ArrowLeft':
          updatePos(4)
          break
        case 'ArrowRight':
          updatePos(7)
          break
        case '>':
          if (player.x === stairs.x && player.y === stairs.y) {
            location.reload()
          }
          updatePos(8)
        // nothing
        break
      }
    } else {
      switch (e.key) {
        case 'ArrowUp':
        case 'k':
          updatePos(0)
          break
        case 'ArrowDown':
        case 'j':
          updatePos(1)
          break
        case 'ArrowLeft':
        case 'h':
          updatePos(2)
          break
        case 'ArrowRight':
        case 'l':
          updatePos(3)
          break
        case 'y':
          updatePos(4)
          break
        case 'u':
          updatePos(5)
          break
        case 'b':
          updatePos(6)
          break
        case 'n':
          updatePos(7)
          break
        case '.':
          // nothing
          updatePos(8)
          break
        default:
          break
      }
    }
  }
}
