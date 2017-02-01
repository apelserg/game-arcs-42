// ============================
// Разработчик: apelserg ; https://github.com/apelserg/
// Лицензия: WTFPL
// ============================

"use strict";

// Глобальные переменные
//

var APELSERG = {};

APELSERG.MAIN = {};
APELSERG.MODEL = {};
APELSERG.CANVA = {};
APELSERG.UI = {};
APELSERG.LANG = {};
APELSERG.CONFIG = {};
APELSERG.CONFIG.SET = {};
APELSERG.CONFIG.KEY = {};
APELSERG.CONFIG.PROC = {};
APELSERG.CONFIG.RESULT = {};

//===
// старт программы (начальная прорисовка)
//===
APELSERG.MAIN.OnLoad = function (initFirst) {

    // определить место загрузки
    //
    window.location.protocol == "file:" ? APELSERG.CONFIG.PROC.LoadFromWeb = false : APELSERG.CONFIG.PROC.LoadFromWeb = true;

    // инициализация
    //
    APELSERG.CONFIG.GetConfigOnLoad();
    APELSERG.CONFIG.GetResultOnLoad();

    // звук
    //
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        APELSERG.CONFIG.PROC.AudioCtx = new window.AudioContext();
    }
    catch (e) {
        APELSERG.CONFIG.PROC.AudioCtx = null;
    }

    // канва
    //
    APELSERG.CONFIG.PROC.CanvaID = document.getElementById('APELSERG_CanvasArcs');
    APELSERG.CONFIG.PROC.Ctx = APELSERG.CONFIG.PROC.CanvaID.getContext('2d');
    APELSERG.CONFIG.PROC.CanvaID.width = APELSERG.CONFIG.SET.CourtColTileNum * APELSERG.CONFIG.SET.TileWidth;
    APELSERG.CONFIG.PROC.CanvaID.height = APELSERG.CONFIG.SET.CourtRowTileNum * APELSERG.CONFIG.SET.TileHeight;
    APELSERG.CONFIG.PROC.CanvaID.style.cursor = "crosshair"; //"none"; //"crosshair"; //"move";

    APELSERG.CONFIG.PROC.Balls[0] = new APELSERG.MODEL.Ball(); // мячи
    APELSERG.CONFIG.PROC.Balls[1] = new APELSERG.MODEL.Ball();
    APELSERG.CONFIG.PROC.Rackets[0] = new APELSERG.MODEL.Racket(0); // ракетки
    APELSERG.CONFIG.PROC.Rackets[1] = new APELSERG.MODEL.Racket(1);
    APELSERG.MODEL.SetRacketOnStart(0);
    APELSERG.MODEL.SetRacketOnStart(1);

    APELSERG.CONFIG.PROC.Step = 1;
    APELSERG.CONFIG.PROC.TileRows = 1;
    APELSERG.CONFIG.PROC.Tiles = APELSERG.MODEL.GetTiles(); // плитки

    APELSERG.MAIN.Stop(); // отрисовка наименований кнопок

    // только для начальной инициализации
    //
    if (initFirst) {
        APELSERG.MAIN.Animation(); // пуск анимации

        //===
        // Движения мыши
        //===
        APELSERG.CONFIG.PROC.CanvaID.addEventListener('mousemove', function (event) {

            if (!APELSERG.CONFIG.PROC.GamePause) {
                for (var n = 0; n < 2; n++) {
                    if (APELSERG.CONFIG.PROC.Rackets[n].Device == 3) {

                        var mouseMoveX = event.clientX - APELSERG.CONFIG.PROC.CanvaID.offsetLeft;

                        APELSERG.CONFIG.PROC.Rackets[n].X = mouseMoveX - APELSERG.CONFIG.SET.RacketWidth / 2;
                    }
                }
            }
        });

        //===
        // Двойной клик мыши
        //===
        APELSERG.CONFIG.PROC.CanvaID.addEventListener('dblclick', function (event) {
            if (APELSERG.CONFIG.PROC.GameStop) APELSERG.MAIN.Start();
            if (APELSERG.CONFIG.PROC.GamePause) APELSERG.MAIN.Pause();
        });
    }
}

//===
// Обработка нажатий клавиш
//===
window.addEventListener('keydown', function (event) {

    // предотвратить срабатывание при "всплытии" клика
    //
    document.getElementById("APELSERG_InputSettings").blur();
    document.getElementById("APELSERG_InputPoints").blur();
    document.getElementById("APELSERG_InputHelp").blur();
    document.getElementById("APELSERG_InputStartStop").blur();

    // пробел [SPACE]
    //
    if (event.keyCode == APELSERG.CONFIG.KEY.Space) {
        APELSERG.MAIN.Start();
        return;
    }

    // пауза [P]
    //
    if (event.keyCode == APELSERG.CONFIG.KEY.Pause) {
        APELSERG.MAIN.Pause();
        return;
    }

    // звук [S]
    //
    if (event.keyCode == APELSERG.CONFIG.KEY.Sound) {
        APELSERG.CONFIG.SET.OnSound = !APELSERG.CONFIG.SET.OnSound;
        return;
    }

    // стрелки
    //
    for (var n = 0; n < 2; n++) {

        var racket = APELSERG.CONFIG.PROC.Rackets[n];

        if (racket.Device == 1) {

            if (event.keyCode == APELSERG.CONFIG.KEY.Left) {
                if (racket.X > 0) racket.X -= racket.MoveX;
                return;
            }
            if (event.keyCode == APELSERG.CONFIG.KEY.Right) {
                if ((racket.X + racket.Width) < (APELSERG.CONFIG.PROC.CanvaID.width - 0)) racket.X += racket.MoveX;
                return;
            }
        }
    }
});

//===
// Старт
//===
APELSERG.MAIN.Start = function () {

    // закрыть окна (если открыты - должны закрыться)
    //
    if (APELSERG.CONFIG.PROC.UiSettings) APELSERG.UI.ShowSettings();
    if (APELSERG.CONFIG.PROC.UiPoints) APELSERG.UI.ShowPoints();
    if (APELSERG.CONFIG.PROC.UiHelp) APELSERG.UI.ShowHelp();

    // старт
    //
    if (APELSERG.CONFIG.PROC.GameStop) {

        document.getElementById('APELSERG_InputSettings').value = '-';
        document.getElementById('APELSERG_InputPoints').value = '-';
        document.getElementById('APELSERG_InputHelp').value = '-';
        document.getElementById('APELSERG_InputStartStop').value = APELSERG.LANG.GetText('STOP');

        // новая игра - инициализация
        //
        APELSERG.CONFIG.PROC.GameStop = false;
        APELSERG.CONFIG.PROC.GamePause = false;
        APELSERG.CONFIG.PROC.CurrTime = 0;
        APELSERG.CONFIG.PROC.StartCnt = APELSERG.CONFIG.SET.StartCnt; // установить задержку старта

        APELSERG.CONFIG.PROC.Rackets[0].Points = 0;
        APELSERG.CONFIG.PROC.Rackets[1].Points = 0;

        APELSERG.MODEL.SetRacketOnStart(0); // установка ракеток
        APELSERG.MODEL.SetRacketOnStart(1);

        APELSERG.CONFIG.PROC.Step = 1;
        APELSERG.CONFIG.PROC.TileRows = 1;
        APELSERG.CONFIG.PROC.Tiles = APELSERG.MODEL.GetTiles(); // плитки
    }
    else {
        if (APELSERG.CONFIG.PROC.GamePause) {
            APELSERG.MAIN.Pause();
        }
    }
}

//===
// Стоп
//===
APELSERG.MAIN.Stop = function () {

    document.getElementById('APELSERG_InputSettings').value = APELSERG.LANG.GetText('CONFIG');
    document.getElementById('APELSERG_InputPoints').value = APELSERG.LANG.GetText('SCORE');
    document.getElementById('APELSERG_InputHelp').value = APELSERG.LANG.GetText('HELP');
    document.getElementById('APELSERG_InputStartStop').value = APELSERG.LANG.GetText('START');

    APELSERG.CONFIG.PROC.GameStop = true;
}

//===
// Старт/Стоп/Продолжить (для кнопки)
//===
APELSERG.MAIN.StartStopContinue = function () {
    if (APELSERG.CONFIG.PROC.GameStop) {
        APELSERG.MAIN.Start();
    }
    else {
        if (APELSERG.CONFIG.PROC.GamePause) {
            APELSERG.MAIN.Pause();
        }
        else {
            APELSERG.MAIN.Stop();
        }
    }
}

//===
// Пауза
//===
APELSERG.MAIN.Pause = function () {
    if (!APELSERG.CONFIG.PROC.GameStop) {
        if (APELSERG.CONFIG.PROC.GamePause) {
            document.getElementById('APELSERG_InputStartStop').value = APELSERG.LANG.GetText('STOP');
            APELSERG.CONFIG.PROC.GamePause = false;
        }
        else {
            document.getElementById('APELSERG_InputStartStop').value = APELSERG.LANG.GetText('CONTINUE');
            APELSERG.CONFIG.PROC.GamePause = true;
        }
    }
}

//===
// Рабочий цикл анимации
//===
APELSERG.MAIN.Animation = function () {

    // определить время между циклами
    //
    var prevTime = APELSERG.CONFIG.PROC.CurrTime;

    APELSERG.CONFIG.PROC.CurrTime = new Date().getTime();

    var timeDelta = APELSERG.CONFIG.PROC.CurrTime - prevTime;

    if (timeDelta > 30) timeDelta = 30; // попробовать "скорректировать" лаг (но это не всегда эффективно)

    // перемещение шарика
    //
    if (!APELSERG.CONFIG.PROC.GameStop && !APELSERG.CONFIG.PROC.GamePause) {

        // обратный отсчёт перед подачей
        //
        if (APELSERG.CONFIG.PROC.StartCnt == 0) {

            // определить скорость шарика для текущего цикла
            //
            var speedBallX = timeDelta / APELSERG.CONFIG.SET.SpeedX[APELSERG.CONFIG.SET.SpeedSelector];
            var speedBallY = timeDelta / APELSERG.CONFIG.SET.SpeedY[APELSERG.CONFIG.SET.SpeedSelector];

            for (var n = 0; n < 2; n++) {
                if (APELSERG.CONFIG.PROC.Balls[n].DirX > 0) {
                    APELSERG.CONFIG.PROC.Balls[n].DirX = speedBallX;
                }
                else {
                    APELSERG.CONFIG.PROC.Balls[n].DirX = speedBallX * (-1);
                }

                if (APELSERG.CONFIG.PROC.Balls[n].DirY > 0) {
                    APELSERG.CONFIG.PROC.Balls[n].DirY = speedBallY;
                }
                else {
                    APELSERG.CONFIG.PROC.Balls[n].DirY = speedBallY * (-1);
                }
            }

            // пересчитать положение шарика (окончание игры срабатывает здесь)
            //
            APELSERG.MODEL.UpdateBall(0);
            APELSERG.MODEL.UpdateBall(1);

            // играет комп
            //
            APELSERG.MODEL.CompGame(0);
            APELSERG.MODEL.CompGame(1);
        }
    }

    // звук (здесь, чтобы при остановке звук смог прекратиться)
    //
    APELSERG.MODEL.Sound(0);
    APELSERG.MODEL.Sound(1);

    // отрисовка (при паузе и остановке цикл отрисовки не прекращается)
    //
    APELSERG.CANVA.CourtRewrite();

    // следующий цикл
    //
    window.requestAnimationFrame(function () {
        APELSERG.MAIN.Animation();
    });
}
