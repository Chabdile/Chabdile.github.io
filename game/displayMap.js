// マップ描画関数
function drawMap(canvas, map) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height) // キャンバスをクリア

  map.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const drawTile = tileShapes[cell] // タイルごとの描画関数を取得
      
      if (drawTile) {
        drawTile(ctx,
          colIndex * TILE_SIZE,
          rowIndex * TILE_SIZE,
          1
        )
      }
    })
  })
}

// マップ上にドラゴンと階段を配置
function placeObjects() {
  // 階段配置
  map[stairs.y][stairs.x] = '>';
  // player配置
  map[player.y][player.x] = '@';
  // slime
  slime.act()
  map[slime.y][slime.x] = 'S';
  // ドラゴン配置
  dragon.act()
  map[dragon.y][dragon.x] = 'D';

  count++
}

function updateMap() {
  // 初期化
  placeObjects()
  // プレイヤー周囲のみ描画
  drawplayerPerspective(perspectiveCanvas, map, player)
  // whole map
  drawMap(dungeonCanvas, map)
}


const perspectiveCanvas = document.getElementById('perspectiveCanvas')


// 初期化
const dungeonCanvas = document.getElementById('dungeonCanvas')
updateMap()