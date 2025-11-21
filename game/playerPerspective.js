// プレイヤーの描画範囲
const VIEW_RADIUS = 11 // プレイヤーの周囲タイルを描画

function drawplayerPerspective(canvas, map, player) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)  // キャンバスをクリア

  // 描画範囲の計算
  const startX = Math.max(0, player.x - VIEW_RADIUS)
  const startY = Math.max(0, player.y - VIEW_RADIUS)
  const endX = Math.min(map[0].length, player.x + VIEW_RADIUS + 1)
  const endY = Math.min(map.length, player.y + VIEW_RADIUS + 1)

  // 範囲内のタイルのみ描画
  for (let rowIndex = startY; rowIndex < endY; rowIndex++) {
    for (let colIndex = startX; colIndex < endX; colIndex++) {
      const cell = map[rowIndex][colIndex]
      const drawTile = tileShapes[cell]; // タイルごとの描画関数を取得
      if (drawTile) {
        let scale = 2
        drawTile(
          ctx,
          (colIndex - startX) * TILE_SIZE * scale,
          (rowIndex - startY) * TILE_SIZE * scale,
          scale
        )
      }
    }
  }
}


