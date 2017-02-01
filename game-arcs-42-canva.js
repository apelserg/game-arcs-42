// ============================
// Разработчик: apelserg ; https://github.com/apelserg/
// Лицензия: WTFPL
// ============================

"use strict";

//===
// Полная отрисовка
//===
APELSERG.CANVA.CourtRewrite = function () {
    
    var ctx = APELSERG.CONFIG.PROC.Ctx;

    // Поле
    //
    ctx.fillStyle = '#516A51'; //'darkgreen';
    ctx.fillRect(0, 0, APELSERG.CONFIG.PROC.CanvaID.width, APELSERG.CONFIG.PROC.CanvaID.height);

    // Мячи
    //
    APELSERG.CANVA.BallRewrite(ctx, 0);
    APELSERG.CANVA.BallRewrite(ctx, 1);
     
    // Ракетки
    //
    APELSERG.CANVA.RacketRewrite(ctx, 0);
    APELSERG.CANVA.RacketRewrite(ctx, 1);

    // Плитки
    //
    var tiles = APELSERG.CONFIG.PROC.Tiles;
    for (var n in tiles) {
        APELSERG.CANVA.TileRewrite(ctx, tiles[n]);
    }

    // Пауза
    //
    if (APELSERG.CONFIG.PROC.GamePause && !APELSERG.CONFIG.PROC.GameStop) {
        APELSERG.CANVA.TextRewrite(ctx, APELSERG.LANG.GetText("PAUSE"));
    }

    // Стоп
    //
    if (APELSERG.CONFIG.PROC.GameStop && APELSERG.CONFIG.PROC.Step < APELSERG.CONFIG.SET.Cycles) {
        APELSERG.CANVA.TextRewrite(ctx, APELSERG.LANG.GetText("STOP"));
    }
    if (APELSERG.CONFIG.PROC.GameStop && APELSERG.CONFIG.PROC.Step == APELSERG.CONFIG.SET.Cycles) {
        APELSERG.CANVA.TextRewrite(ctx, APELSERG.LANG.GetText("GAME_OVER"));
    }

    // Инфо
    //
    if (APELSERG.CONFIG.PROC.Step != 0) {
        APELSERG.CANVA.InfoRewrite(ctx);
    }

    // Обратный отсчёт задаржки
    //
    if (APELSERG.CONFIG.PROC.StartCnt > 0) {

        ctx.font = (40).toString() + "px Arial";
        ctx.fillStyle = "yellow";
        ctx.textAlign = "center";
        ctx.fillText(APELSERG.CONFIG.PROC.StartCnt.toString(), APELSERG.CONFIG.PROC.CanvaID.width / 2, APELSERG.CONFIG.PROC.CanvaID.height / 2 - 20);

        APELSERG.CONFIG.PROC.StartCnt--;
    }

    // Обратный отсчёт сообщения об ошибке
    //
    if (APELSERG.CONFIG.PROC.ErrorCnt > 0) {

        ctx.font = "30px Arial";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.fillText(APELSERG.CONFIG.PROC.ErrorMsg, APELSERG.CONFIG.PROC.CanvaID.width / 2, APELSERG.CONFIG.PROC.CanvaID.height / 2 + 10);

        APELSERG.CONFIG.PROC.ErrorCnt--;
        if (APELSERG.CONFIG.PROC.ErrorCnt == 0) APELSERG.CONFIG.PROC.ErrorMsg = "";
    }
    
    // Рамка
    //
    ctx.lineWidth = 10;
    ctx.strokeStyle = "silver";
    ctx.strokeRect(0, 0, APELSERG.CONFIG.PROC.CanvaID.width, APELSERG.CONFIG.PROC.CanvaID.height);
}

//===
// Мяч
//===
APELSERG.CANVA.BallRewrite = function (ctx, ballNum) {

    if (APELSERG.CONFIG.PROC.Rackets[ballNum].Device == 0)
        return;

    var ball = APELSERG.CONFIG.PROC.Balls[ballNum];

    ctx.beginPath();
    ctx.arc(ball.X, ball.Y, ball.Radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = ball.Color;
    ctx.fill();
}

//===
// Ракетка
//===
APELSERG.CANVA.RacketRewrite = function (ctx, racketNum) {

    if (APELSERG.CONFIG.PROC.Rackets[racketNum].Device == 0)
        return;

    var racket = APELSERG.CONFIG.PROC.Rackets[racketNum];
    var fontHight = racket.Height - 4;

    ctx.fillStyle = racket.Color;
    if (racket.RedCnt > 0) { // красная ракетка
        racket.RedCnt--;
        ctx.fillStyle = "red";
    }
    if (racket.SideCnt > 0) { // в бок ракетки
        racket.SideCnt--;
        ctx.fillStyle = "yellow";
    }
    ctx.fillRect(racket.X, racket.Y, racket.Width, racket.Height);

    ctx.textAlign = "center";
    ctx.font = fontHight.toString() + "px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(racket.Points.toString(), racket.X + racket.Width / 2, racket.Y + racket.Height - 4);
}

//===
// Плитка
//===
APELSERG.CANVA.TileRewrite = function (ctx, tile) {

    var fontHight = APELSERG.CONFIG.SET.BallSize;

    var xR = (tile.Col - 1) * APELSERG.CONFIG.SET.TileWidth;
    var xL = APELSERG.CONFIG.SET.TileWidth;
    var yR = (tile.Row - 1) * APELSERG.CONFIG.SET.TileHeight;
    var yL = APELSERG.CONFIG.SET.TileHeight;

    ctx.fillStyle = tile.Color;
    ctx.fillRect(xR, yR, xL, yL);

    ctx.textAlign = "center";
    ctx.font = fontHight.toString() + "px Arial"; //ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(tile.Point.toString(), xR + xL / 2, yR + yL - 4);
}

//===
// Текст
//===
APELSERG.CANVA.TextRewrite = function (ctx, strText) {

    var fontHight = APELSERG.CONFIG.SET.BallSize;

    if (fontHight < 20) {
        fontHight = 20;
    }
    if (fontHight > 30) {
        fontHight = 30;
    }

    ctx.font = fontHight.toString() + "px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(strText, APELSERG.CONFIG.PROC.CanvaID.width / 2, APELSERG.CONFIG.PROC.CanvaID.height / 2);
}

//===
// Инфо
//===
APELSERG.CANVA.InfoRewrite = function (ctx) {

    var fontHight = APELSERG.CONFIG.SET.BallSize - 4;  //16;
    var strText = APELSERG.LANG.GetText("LABEL_LEVEL") + " : " + APELSERG.CONFIG.PROC.Step.toString() + "  (" + APELSERG.CONFIG.SET.Cycles.toString() + ")";

    ctx.font = fontHight.toString() + "px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(strText, APELSERG.CONFIG.PROC.CanvaID.width / 2, APELSERG.CONFIG.PROC.CanvaID.height - 10);
}
