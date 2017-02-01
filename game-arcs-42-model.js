// ============================
// Разработчик: apelserg ; https://github.com/apelserg/
// Лицензия: WTFPL
// ============================

"use strict";

//===
// Базовый объект - мяч
//===
APELSERG.MODEL.Ball = function () {
    this.X = 0;
    this.Y = 0;
    this.Radius = APELSERG.CONFIG.SET.BallSize / 2;
    this.DirX = 0; // направление и скорость по X
    this.DirY = 0; // направление и скорость по Y
    this.DirXSpeedUp = 0; // ускорение по X
    this.DirYSpeedUp = 0; // ускорение по Y
    this.Color = 'white';
}

//===
// Базовый объект - ракетка
//===
APELSERG.MODEL.Racket = function (racketNum) {

    this.Device = APELSERG.CONFIG.SET.UserDevice[racketNum];

    if (this.Device == 10) this.Name = "COMP";
    else if (this.Device == 11) this.Name = "COMP Exp";
    else this.Name = APELSERG.CONFIG.SET.UserName[racketNum];

    this.Points = 0;
    this.X = 0;
    this.Y = 0;
    this.Height = APELSERG.CONFIG.SET.RacketHeight;
    this.Width = APELSERG.CONFIG.SET.RacketWidth;
    this.MoveX = APELSERG.CONFIG.SET.RacketWidth;
    this.RedCnt = 0;
    this.SideCnt = 0;
    this.AudioCnt = 0;
    this.AudioTone = 0;
    this.AudioOsc;
    this.Color = 'white';
}

//===
// Базовый объект - плитка
//===
APELSERG.MODEL.Tile = function (tileRow, tileCol, tileColor, tilePoint) {
    this.Row = tileRow;
    this.Col = tileCol;
    this.Color = tileColor;
    this.Point = tilePoint;
}

//===
// Новое поле плиток
//===
APELSERG.MODEL.GetTiles = function () {

    var tiles = [];

    for (var row = 0 ; row < APELSERG.CONFIG.PROC.TileRows; row++)
    {
        for (var col = 0 ; col < APELSERG.CONFIG.SET.CourtColTileNum; col++) {

            var color = APELSERG.MODEL.GetColor();
            var point = APELSERG.MODEL.GetRandomNumber(100);

            tiles.push(new APELSERG.MODEL.Tile(row + 1, col + 1, color, point));
        }
    }
    return tiles; 
}

//===
// Установить ракетку на стартовую позицию
//===
APELSERG.MODEL.SetRacketOnStart = function (racketNum) {

    var racketX = 0;
    var racketY = APELSERG.CONFIG.PROC.CanvaID.height - (APELSERG.CONFIG.SET.RacketHeight * 2);
    var racketColor = 'darkblue';
    var ballColor = 'yellow';

    if (racketNum == 1) {
        racketX = APELSERG.CONFIG.PROC.CanvaID.width - APELSERG.CONFIG.SET.RacketWidth;
        racketY = racketY - APELSERG.CONFIG.SET.RacketHeight;
        racketColor = '#663300';
        var ballColor = 'orange';
    }
    APELSERG.CONFIG.PROC.Rackets[racketNum].X = racketX;
    APELSERG.CONFIG.PROC.Rackets[racketNum].Y = racketY;
    APELSERG.CONFIG.PROC.Rackets[racketNum].Color = racketColor;

    APELSERG.CONFIG.PROC.Balls[racketNum].X = racketX + APELSERG.CONFIG.SET.RacketWidth / 2;
    APELSERG.CONFIG.PROC.Balls[racketNum].Y = APELSERG.CONFIG.PROC.CanvaID.height - APELSERG.CONFIG.SET.BallSize / 2 - 10;
    APELSERG.CONFIG.PROC.Balls[racketNum].Color = ballColor;
    APELSERG.CONFIG.PROC.Balls[racketNum].DirX = 0;
    APELSERG.CONFIG.PROC.Balls[racketNum].DirY = 0;
    APELSERG.CONFIG.PROC.Balls[racketNum].DirXSpeedUp = 0;
    APELSERG.CONFIG.PROC.Balls[racketNum].DirYSpeedUp = 0;
}

//===
// Случайное направление
//===
APELSERG.MODEL.GetRandomDir = function () {
    if (Math.round(Math.random() * 10) % 2 == 0) return 1;
    else return -1;
}

//===
// Получить случайное число из диапазона
//===
APELSERG.MODEL.GetRandomNumber = function (max) {
    return Math.round(Math.random() * 100) % max;
}

//===
// Получить случайный цвет из списка
//===
APELSERG.MODEL.GetColor = function () {
    var colors = ['#CC3300', '#FF9900', '#660033', '#009933', '#3399FF', '#0033CC', '#9900CC'];
    return colors[APELSERG.MODEL.GetRandomNumber(colors.length)];
}

//===
// Переместить мяч
//===
APELSERG.MODEL.UpdateBall = function (racketNum) {

    if (APELSERG.CONFIG.PROC.GameStop || APELSERG.CONFIG.PROC.GamePause)
        return;

    if (APELSERG.CONFIG.PROC.Rackets[racketNum].Device == 0)
        return;

    var ball = APELSERG.CONFIG.PROC.Balls[racketNum];
    var racket = APELSERG.CONFIG.PROC.Rackets[racketNum];
    var tiles = APELSERG.CONFIG.PROC.Tiles;

    //  Отскок от левой стороны корта
    //
    if (ball.X <= ball.Radius) {
        ball.X = ball.Radius;
        ball.DirX *= -1;
    }

    //  Отскок от правой стороны корта
    //
    if (ball.X >= (APELSERG.CONFIG.PROC.CanvaID.width - ball.Radius)) {
        ball.X = APELSERG.CONFIG.PROC.CanvaID.width - ball.Radius;
        ball.DirX *= -1;
    }

    // Учитывать только место расположения плиток
    //
    if (ball.Y < APELSERG.CONFIG.PROC.TileRows * APELSERG.CONFIG.SET.TileHeight + APELSERG.CONFIG.SET.BallSize) {

        //  Отскок от плитки
        //
        if (!APELSERG.MODEL.TileBallKickback(ball, racket)) {

            //  Отскок от верха корта
            //
            if (ball.Y <= ball.Radius) {
                ball.Y = ball.Radius;
                ball.DirY *= -1;
                ball.DirXSpeedUp -= 1;
            }
        }
    }

    // Учитывать только место расположения ракеток
    //
    if ((ball.DirY > 0) && (ball.Y > APELSERG.CONFIG.PROC.CanvaID.height - 3 * APELSERG.CONFIG.SET.RacketHeight - APELSERG.CONFIG.SET.BallSize)) {

        //  Отскок от ракетки
        //
        if (!APELSERG.MODEL.RacketBallKickback(ball, racket)) {

            //  Отскок от низа корта
            //
            if (ball.Y >= (APELSERG.CONFIG.PROC.CanvaID.height - ball.Radius)) {

                ball.Y = APELSERG.CONFIG.PROC.CanvaID.height - ball.Radius;
                ball.DirY *= -1;
                ball.DirXSpeedUp -= 1;

                racket.Points -= 5 * APELSERG.CONFIG.SET.RacketWidth / APELSERG.CONFIG.SET.BallSize * APELSERG.CONFIG.PROC.Step;
                racket.RedCnt = APELSERG.CONFIG.SET.RedCnt;

                // звук - отскок
                //
                if (racket.AudioCnt == 0) {
                    racket.AudioCnt = APELSERG.CONFIG.SET.AudioCnt;
                    racket.AudioTone = APELSERG.CONFIG.SET.AudioToneRed;
                }
            }
        }
    }

    // игра завершена?
    //
    if (APELSERG.CONFIG.PROC.Tiles.length == 0 && !APELSERG.CONFIG.PROC.GameStop) {

        APELSERG.CONFIG.PROC.Step++;

        if (APELSERG.CONFIG.PROC.Step > APELSERG.CONFIG.SET.Cycles) {
            APELSERG.CONFIG.PROC.Step--;
            APELSERG.MAIN.Stop();
            APELSERG.CONFIG.SetResult();
        }
        else {
            APELSERG.CONFIG.PROC.StartCnt = APELSERG.CONFIG.SET.StartCnt; // установить задержку старта
            APELSERG.CONFIG.PROC.TileRows++;
            APELSERG.MODEL.SetRacketOnStart(0); // установка ракеток
            APELSERG.MODEL.SetRacketOnStart(1);
            APELSERG.CONFIG.PROC.Tiles = APELSERG.MODEL.GetTiles(); // плитки
        }
    }
    else {
        // движение мяча
        //
        if (ball.DirX > 0) {
            ball.X += ball.DirX + ball.DirXSpeedUp;
        }
        else {
            ball.X += ball.DirX - ball.DirXSpeedUp;
        }

        if (ball.DirY > 0) {
            ball.Y += ball.DirY + ball.DirYSpeedUp;;
        }
        else {
            ball.Y += ball.DirY - ball.DirYSpeedUp;;
        }
    }
}

//===
// Отскок от плитки
//===
APELSERG.MODEL.TileBallKickback = function (ball, racket) {

    var tileKick = false;

    for (var n in APELSERG.CONFIG.PROC.Tiles) {

        var tile = APELSERG.CONFIG.PROC.Tiles[n];

        var tX = (tile.Col - 1) * APELSERG.CONFIG.SET.TileWidth;
        var tY = (tile.Row - 1) * APELSERG.CONFIG.SET.TileHeight;

        // низ плитки
        //
        /*
        с учётом радиуса мяча

        if ((ball.DirY < 0)
            && (ball.Y >= tY)
            && ((ball.Y - ball.Radius) <= (tY + APELSERG.CONFIG.SET.TileHeight))
            &&((ball.X + ball.Radius) >= tX)
            && ((ball.X - ball.Radius) <= (tX + APELSERG.CONFIG.SET.TileWidth))) {
            */
        if ((ball.DirY < 0)
            && (ball.Y >= tY)
            && (ball.Y <= (tY + APELSERG.CONFIG.SET.TileHeight))
            && (ball.X >= tX)
            && (ball.X <= (tX + APELSERG.CONFIG.SET.TileWidth))) {

            ball.Y = (tY + APELSERG.CONFIG.SET.TileHeight) + ball.Radius;
            ball.DirY *= -1;
            tileKick = true;
        }

        // верх плитки
        //
        /*
        с учётом радиуса мяча

        if ((ball.DirY > 0)
            && ((ball.Y + ball.Radius) >= tY)
            && (ball.Y <= (tY + APELSERG.CONFIG.SET.TileHeight))
            && ((ball.X + ball.Radius) >= tX)
            && ((ball.X - ball.Radius) <= (tX + APELSERG.CONFIG.SET.TileWidth))) {
            */
        if ((ball.DirY > 0)
            && (ball.Y >= tY)
            && (ball.Y <= (tY + APELSERG.CONFIG.SET.TileHeight))
            && (ball.X >= tX)
            && (ball.X <= (tX + APELSERG.CONFIG.SET.TileWidth))) {
            
            ball.Y = tY - ball.Radius;
            ball.DirY *= -1;
            tileKick = true;
        }

        // левый бок плитки
        //
        /*
        с учётом радиуса мяча

        if ((ball.DirX > 0)
            && (ball.Y >= tY)
            && (ball.Y <= (tY + APELSERG.CONFIG.SET.TileHeight))
            && ((ball.X + ball.Radius) >= tX)
            && ((ball.X + ball.Radius) <= (tX + APELSERG.CONFIG.SET.TileWidth))) {
            */
        if ((ball.DirX > 0)
            && (ball.Y >= tY)
            && (ball.Y <= (tY + APELSERG.CONFIG.SET.TileHeight))
            && (ball.X >= tX)
            && (ball.X <= (tX + APELSERG.CONFIG.SET.TileWidth))) {

            ball.X = tX - ball.Radius;
            ball.DirX *= -1;
            tileKick = true;
        }

        // правый бок плитки
        //
        /*
        с учётом радиуса мяча

        if ((ball.DirX < 0)
            && (ball.Y >= tY)
            && (ball.Y <= (tY + APELSERG.CONFIG.SET.TileHeight))
            && ((ball.X + ball.Radius) >= tX)
            && ((ball.X - ball.Radius) <= (tX + APELSERG.CONFIG.SET.TileWidth))) {
            */
        if ((ball.DirX < 0)
            && (ball.Y >= tY)
            && (ball.Y <= (tY + APELSERG.CONFIG.SET.TileHeight))
            && (ball.X >= tX)
            && (ball.X <= (tX + APELSERG.CONFIG.SET.TileWidth))) {

            ball.X = (tX + APELSERG.CONFIG.SET.TileWidth) + ball.Radius;
            ball.DirX *= -1;
            tileKick = true;
        }

        if (tileKick) {

            ball.DirXSpeedUp = APELSERG.MODEL.GetRandomNumber(3);
            ball.DirYSpeedUp = APELSERG.MODEL.GetRandomNumber(7);

            racket.Points += tile.Point; // очки

            APELSERG.CONFIG.PROC.Tiles.splice(n, 1); // убрать плитку

            // звук - отскок от плитки
            //
            if (racket.AudioCnt == 0) {
                racket.AudioCnt = APELSERG.CONFIG.SET.AudioCnt;
                racket.AudioTone = APELSERG.CONFIG.SET.AudioToneTile;
            }

            break;
        }
    }

    return tileKick;
}

//===
// Отскок от ракетки
//===
APELSERG.MODEL.RacketBallKickback = function (ball, racket) {

    var racketKick = false;

    /*
    с учётом радиуса мяча

    if ((ball.DirY > 0)
        && ((ball.Y + ball.Radius) >= racket.Y)
        && ((ball.Y + ball.Radius) <= (racket.Y + racket.Height))
        && ((ball.X + ball.Radius) >= racket.X)
        && ((ball.X - ball.Radius) <= (racket.X + racket.Width))) {
        */
    if ((ball.DirY > 0)
        && (ball.Y >= racket.Y)
        && (ball.Y <= (racket.Y + racket.Height))
        && (ball.X >= racket.X)
        && (ball.X <= (racket.X + racket.Width))) {

        ball.Y = racket.Y - ball.Radius;
        ball.DirY *= -1;

        ball.DirXSpeedUp = APELSERG.MODEL.GetRandomNumber(3);
        ball.DirYSpeedUp = APELSERG.MODEL.GetRandomNumber(7);

        // случайная корректировка направления
        //
        if (ball.DirXSpeedUp > ball.DirYSpeedUp) {
            ball.DirXSpeedUp *= -1;
        }

        // удар в бок ракетки
        //
        if (ball.X <= (racket.X + APELSERG.CONFIG.SET.BallSize) || ball.X >= (racket.X + racket.Width - APELSERG.CONFIG.SET.BallSize)) {

            ball.DirXSpeedUp += 5;
            ball.DirYSpeedUp += 2;

            racket.SideCnt = APELSERG.CONFIG.SET.RedCnt;

            // звук - отскок от ракетки (бок)
            //
            if (racket.AudioCnt == 0) {
                racket.AudioCnt = APELSERG.CONFIG.SET.AudioCnt;
                racket.AudioTone = APELSERG.CONFIG.SET.AudioToneRacketSide;
            }
        }

        // звук - отскок от ракетки
        //
        if (racket.AudioCnt == 0) {
            racket.AudioCnt = APELSERG.CONFIG.SET.AudioCnt;
            racket.AudioTone = APELSERG.CONFIG.SET.AudioToneRacket;
        }

        racketKick = true;
    }

    return racketKick;
}

//===
// Звук
//===
APELSERG.MODEL.Sound = function (racketNum) {

    if (APELSERG.CONFIG.PROC.Rackets[racketNum].AudioCnt == 0)
        return;

    if (!APELSERG.CONFIG.SET.OnSound)
        return;

    if (APELSERG.CONFIG.PROC.AudioCtx == null)
        return;

    var racket = APELSERG.CONFIG.PROC.Rackets[racketNum];

    if (racket.AudioCnt == APELSERG.CONFIG.SET.AudioCnt) {

        racket.AudioOsc = APELSERG.CONFIG.PROC.AudioCtx.createOscillator();
        racket.AudioOsc.frequency.value = racket.AudioTone;
        racket.AudioOsc.connect(APELSERG.CONFIG.PROC.AudioCtx.destination);
        racket.AudioOsc.start();

    }
    if (racket.AudioCnt == 1) {
        racket.AudioOsc.stop();
    }

    racket.AudioCnt--;
}

//===
// Играет комп
//===
APELSERG.MODEL.CompGame = function (racketNum) {

    if (APELSERG.CONFIG.PROC.Rackets[racketNum].Device < 10)
        return;

    var racket = APELSERG.CONFIG.PROC.Rackets[racketNum];
    var ball = APELSERG.CONFIG.PROC.Balls[racketNum];

    var distance = ball.X - (racket.X + racket.Width / 2);

    var speedMax = 7;
    var speedNorm = 5;
    var speedMin = 2;

    if (racket.Device == 11) {
        speedMax = 12;
        speedNorm = 8;
        speedMin = 3;
    }

    if (ball.DirY > 0) {

        if (distance > 50) racket.X += speedMax + APELSERG.CONFIG.SET.SpeedSelector;
        else if (distance > 30) racket.X += speedNorm + APELSERG.CONFIG.SET.SpeedSelector;
        else if (distance > 0) racket.X += speedMin + APELSERG.CONFIG.SET.SpeedSelector;

        if (distance < -50) racket.X -= speedMax + APELSERG.CONFIG.SET.SpeedSelector;
        else if (distance < -30) racket.X -= speedNorm + APELSERG.CONFIG.SET.SpeedSelector;
        else if (distance < 0) racket.X -= speedMin + APELSERG.CONFIG.SET.SpeedSelector;
    }
}
