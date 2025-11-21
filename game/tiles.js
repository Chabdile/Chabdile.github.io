// タイルサイズ
const TILE_SIZE = 6

// タイルごとの描画設定
const tileShapes = {
  ' ': (ctx, x, y, scale) => {
    ctx.fillStyle = 'black' // 壁の色
    ctx.fillRect(x, y, TILE_SIZE * scale, TILE_SIZE * scale)
  },
  '#': (ctx, x, y, scale) => {
    ctx.fillStyle = 'gray' // 壁の色
    ctx.fillRect(x, y, TILE_SIZE * scale, TILE_SIZE * scale)
  },
  '.': (ctx, x, y, scale) => {
    ctx.fillStyle = 'white' // 床の色
    ctx.fillRect(x, y, TILE_SIZE * scale, TILE_SIZE * scale)

    // 床に装飾（例: 小さな点）
    ctx.fillStyle = 'lightgray'
    ctx.beginPath()
    ctx.arc(x + TILE_SIZE * scale / 2, y + TILE_SIZE * scale / 2, TILE_SIZE * scale / 10, 0, Math.PI * 2)
    ctx.fill()
  },
  'O': (ctx, x, y, scale) => {
    ctx.fillStyle = 'violet' // 壁の色
    ctx.fillRect(x, y, TILE_SIZE * scale, TILE_SIZE * scale)
  },
  '|': (ctx, x, y, scale) => {
    ctx.fillStyle = 'darkgray' // 縦壁の色
    ctx.fillRect(x + TILE_SIZE * scale / 3, y, TILE_SIZE * scale / 3, TILE_SIZE * scale) // 縦線
  },
  '-': (ctx, x, y, scale) => {
    ctx.fillStyle = 'darkgray' // 横壁の色
    ctx.fillRect(x, y + TILE_SIZE * scale / 3, TILE_SIZE * scale, TILE_SIZE * scale / 3) // 横線
  },
  ',': (ctx, x, y, scale) => {
    ctx.fillStyle = 'lightgray' // アイテム非設置エリア
    ctx.fillRect(x, y, TILE_SIZE * scale, TILE_SIZE * scale)

    // // 点線で装飾
    // ctx.strokeStyle = 'gray'
    // ctx.setLineDash([TILE_SIZE * scale / 5, TILE_SIZE * scale / 10])
    // ctx.strokeRect(x + 1, y + 1, TILE_SIZE * scale - 2, TILE_SIZE * scale - 2)
    // ctx.setLineDash([]) // 点線をリセット
  },
  '@': (ctx, x, y, scale) => { // player
    ctx.fillStyle = 'orange' // playerの色
    ctx.fillRect(x, y, TILE_SIZE * scale, TILE_SIZE * scale)
  },
  'S': (ctx, x, y, scale) => { // slime
    if (slime.state === "unnoticed") ctx.fillStyle = 'cyan'
    else if (slime.state === "searching") ctx.fillStyle = 'limegreen'
    else if (slime.state === "detected") ctx.fillStyle = 'brown'
    else ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(x + TILE_SIZE * scale / 2, y + TILE_SIZE * scale / 2, TILE_SIZE * scale / 3, 0, Math.PI * 2)
    ctx.fill()
  },
  'D': (ctx, x, y, scale) => { // ドラゴン
    if (dragon.state === "unnoticed") ctx.fillStyle = 'blue'
    else if (dragon.state === "searching") ctx.fillStyle = 'green'
    else if (dragon.state === "detected") ctx.fillStyle = 'red'
    else ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(x + TILE_SIZE * scale / 2, y + TILE_SIZE * scale / 2, TILE_SIZE * scale / 3, 0, Math.PI * 2)
    ctx.fill()
  },
  '>': (ctx, x, y, scale) => { // 階段
    ctx.fillStyle = 'cyan'
    ctx.fillRect(x, y, TILE_SIZE * scale, TILE_SIZE * scale)
    ctx.fillStyle = 'white'
    ctx.fillRect(x, y, TILE_SIZE * scale / 2, TILE_SIZE * scale / 2)
    ctx.fillRect(x + TILE_SIZE * scale / 2, y, TILE_SIZE * scale / 4, TILE_SIZE * scale / 4)
    ctx.fillRect(x, y + TILE_SIZE * scale / 2, TILE_SIZE * scale / 4, TILE_SIZE * scale / 4)
  }
}