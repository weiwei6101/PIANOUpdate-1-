// 游戏变量
var main = document.getElementById('main');
var startBtn = document.getElementById('start-btn');
var speed = 5, num = 0, timer, flag = true;
var colors = ['red', 'green', 'black', 'blue'];
var currentUser = null;
var soundEnabled = true;
var musicEnabled = true;
var errorCount = 0;
var maxErrors = 3;
var isGameOver = false;

// 按键映射
var keyMap = {
    'a': 0, // 红色
    's': 1, // 绿色
    'd': 2, // 黑色
    'f': 3  // 蓝色
};

// 音频元素
var keySounds = [
    document.getElementById('key-a-sound'),
    document.getElementById('key-s-sound'),
    document.getElementById('key-d-sound'),
    document.getElementById('key-f-sound')
];
var wrongSound = document.getElementById('wrong-sound');
var backgroundMusic = new Audio('sound/bgm.mp3'); // 背景音乐

// 播放按键音效
function playKeySound(colorIndex) {
    if (soundEnabled) {
        const sound = keySounds[colorIndex];
        sound.currentTime = 0; // 确保每次播放都从头开始
        sound.play().catch(e => console.log('按键音效播放失败:', e));
    }
}

// 初始化游戏
function initGame() {
    // 设置事件监听
    startBtn.addEventListener('click', startGame);
    document.getElementById('sound-effects').addEventListener('change', toggleSound);
    document.getElementById('background-music').addEventListener('change', toggleMusic);
    document.getElementById('difficulty').addEventListener('change', changeDifficulty);

    // 加载用户设置
    loadSettings();

    // 设置界面切换按钮
    setupNavigation();
    // 游戏结束切换按钮
    setupGameOverButtons();
    // 修改头像
    setupAvatarUpload();

    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeyPress);

    // 创建按键提示
    createKeyHints();
}

// 创建按键提示
function createKeyHints() {
    const keyHint = document.createElement('div');
    keyHint.className = 'key-hint';

    const keys = ['A', 'S', 'D', 'F'];
    const colors = ['red', 'green', 'black', 'blue'];

    keys.forEach((key, index) => {
        const hintItem = document.createElement('div');
        hintItem.className = 'key-hint-item';

        const keyElement = document.createElement('div');
        keyElement.className = 'key-hint-key';
        keyElement.textContent = key;

        const colorElement = document.createElement('div');
        colorElement.className = 'key-hint-color';
        colorElement.style.backgroundColor = colors[index];

        hintItem.appendChild(keyElement);
        hintItem.appendChild(colorElement);
        keyHint.appendChild(hintItem);
    });

    document.querySelector('.wrapper').appendChild(keyHint);
}

// 开始游戏
function startGame() {
    isGameOver = false;
    num = 0;
    errorCount = 0;
    flag = true;
    speed = getCurrentSpeed();
    document.getElementById('score').textContent = num;
    document.getElementById('errors').textContent = `${errorCount}/${maxErrors}`;
    document.getElementById('go').style.display = 'none';

    // 确保清除所有现有彩块
    main.innerHTML = '';
    main.style.top = '-150px';

    // 创建第一行彩块
    createBlockRow();

    // 开始游戏
    move();

    // 播放背景音乐
    if (musicEnabled) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(e => console.log('Autoplay prevented:', e));
    }
}

// 获取当前速度
function getCurrentSpeed() {
    switch (document.getElementById('difficulty').value) {
        case 'low': return 3;
        case 'medium': return 5;
        case 'high': return 8;
        default: return 5;
    }
}

// 创建新的一行方块
function createBlockRow() {
    var oDiv = document.createElement('div');
    oDiv.setAttribute('class', 'row');

    // 随机决定生成1-2个方块
    const blockCount = Math.random() > 0.5 ? 2 : 1;
    const positions = [];

    for (let i = 0; i < blockCount; i++) {
        let index;
        do {
            index = Math.floor(Math.random() * 4);
        } while (positions.includes(index) && positions.length < 4);

        positions.push(index);
    }

    for (var j = 0; j < 4; j++) {
        var iDiv = document.createElement('div');
        if (positions.includes(j)) {
            iDiv.setAttribute('class', 'i');
            iDiv.style.backgroundColor = colors[j];
            iDiv.dataset.colorIndex = j;
        }
        oDiv.appendChild(iDiv);
    }

    if (main.childNodes.length == 0) {
        main.appendChild(oDiv);
    } else {
        main.insertBefore(oDiv, main.childNodes[0]);
    }
}

// 处理键盘按键
function handleKeyPress(e) {
    if (!flag || isGameOver) return;

    const key = e.key.toLowerCase();
    if (['a', 's', 'd', 'f'].includes(key)) {
        const colorIndex = keyMap[key];
        const judgmentLine = document.querySelector('.judgment-line');
        if (!judgmentLine) return;

        const rect = judgmentLine.getBoundingClientRect();
        const JUDGMENT_LINE_TOP = rect.top;
        const tolerance = 2; // 容错范围（根据判定线高度调整）

        // 获取所有未被标记的有效方块，并按与判定线的距离排序
        const activeBlocks = Array.from(main.querySelectorAll('.i:not(.missed)'))
           .map(block => {
                const blockRect = block.getBoundingClientRect();
                return {
                    block,
                    top: blockRect.top,
                    bottom: blockRect.bottom,
                    colorIndex: parseInt(block.dataset.colorIndex)
                };
            })
           .filter(block => block.bottom >= JUDGMENT_LINE_TOP) // 只保留尚未完全通过判定线的方块
           .sort((a, b) => a.top - b.top); // 按从上到下排序（最接近判定线的在前）

        // 没有有效方块时直接返回
        if (activeBlocks.length === 0) return;

        // 取最接近判定线的方块（第一个）
        const closestBlock = activeBlocks[0];
        const { block, top, bottom, colorIndex: blockColorIndex } = closestBlock;
        const isColorMatch = blockColorIndex === colorIndex;

        console.log(`最接近方块位置: top=${top.toFixed(2)}, bottom=${bottom.toFixed(2)}, 颜色匹配: ${isColorMatch}`);

        // 处理按键逻辑
        if (isColorMatch) {
            // 正确按键：方块覆盖判定线（允许容错范围内）
            if (top <= JUDGMENT_LINE_TOP + tolerance && bottom >= JUDGMENT_LINE_TOP) {
                console.log("✅ 正确按键");
                block.classList.remove('i');
                block.style.backgroundColor = '#bbb';
                num++;
                updateScoreDisplay();
                playKeySound(colorIndex);
                return;
            }
        }

        // 错误按键：颜色不匹配或位置错误
        console.log("❌ 错误按键");
        handleWrongKey(closestBlock.block);

        // 标记最接近的方块为错过（无论颜色是否匹配）
        closestBlock.block.classList.add('missed');
        closestBlock.block.style.backgroundColor = '#ffcccc';
    }
}

// 标记方块为错过，并触发错误处理
function markBlockAsMissed(block) {
    if (!block.classList.contains('missed')) {
        block.classList.add('missed');
        block.style.backgroundColor = '#ffcccc';
        handleWrongKey(block);
    }
}

// 错误处理函数
function handleWrongKey(block) {
    if (!block.dataset.isWrong) {
        errorCount++;
        block.dataset.isWrong = true;
        document.getElementById('errors').textContent = `${errorCount}/${maxErrors}`;
        if (soundEnabled) {
            wrongSound.currentTime = 0;
            wrongSound.play();
        }
        if (errorCount >= maxErrors) endGame();
    }
}

// 游戏循环中移除完全通过判定线的方块
function cleanUpMissedBlocks() {
    const judgmentLineTop = document.querySelector('.judgment-line').getBoundingClientRect().top;
    const missedBlocks = Array.from(main.querySelectorAll('.i.missed'));

    missedBlocks.forEach(block => {
        const blockRect = block.getBoundingClientRect();
        if (blockRect.bottom < judgmentLineTop) {
            block.remove(); // 从DOM中彻底移除已错过的方块
        }
    });
}

// 更新游戏循环
function gameLoop() {
    requestAnimationFrame(() => {
        if (!flag || isGameOver) return;

        moveBlocks(); // 移动方块的逻辑
        cleanUpMissedBlocks(); // 清理已错过的方块
        checkGameOverCondition(); // 检查游戏结束条件
        checkMissedBlocks(); // 检查并标记错过的方块

        gameLoop();
    });
}

// 检查并标记错过的方块（在游戏主循环中调用）
function checkMissedBlocks() {
    if (!flag || isGameOver) return;

    const judgmentLine = document.querySelector('.judgment-line');
    if (!judgmentLine) return;

    const rect = judgmentLine.getBoundingClientRect();
    const JUDGMENT_LINE_TOP = rect.top;

    // 遍历所有行，从顶部开始（最接近判定线的行）
    for (let i = 0; i < main.childNodes.length; i++) {
        const currentRow = main.childNodes[i];
        const blocks = Array.from(currentRow.children).filter(div =>
            div.classList.contains('i') && !div.classList.contains('missed')
        );

        // 检查每个方块是否已经错过
        for (const block of blocks) {
            const blockRect = block.getBoundingClientRect();
            const blockTop = blockRect.top;
            const blockBottom = blockRect.bottom;

            // 如果方块底部已经完全越过判定线，标记为错过
            if (blockBottom < JUDGMENT_LINE_TOP) {
                console.log(`⏰ 自动标记: 方块 ${i} 已错过（完全通过判定线）`);
                markBlockAsMissed(block);
            }
        }
    }
}

// 修改游戏主循环，添加对checkMissedBlocks的调用
function gameLoop() {
    if (!flag || isGameOver) return;

    // 移动所有行
    moveRows();

    // 检查并标记错过的方块
    checkMissedBlocks();

    // 其他游戏逻辑...

    requestAnimationFrame(gameLoop);
}

// 移动方块
function move() {
    clearInterval(timer);
    timer = setInterval(function () {
        if (isGameOver) {
            clearInterval(timer);
            return;
        }

        var step = parseInt(main.offsetTop) + speed;
        main.style.top = step + 'px';

        if (parseInt(main.offsetTop) >= 0) {
            createBlockRow();
            main.style.top = '-150px';
        }

        var len = main.childNodes.length;
        if (len == 6) {
            // 检查是否有未点击的方块
            const bottomRow = main.childNodes[len - 1];
            const missedBlocks = Array.from(bottomRow.children).filter(div => div.classList.contains('i'));

            missedBlocks.forEach(block => {
                markBlockAsMissed(block);
            });

            main.removeChild(main.childNodes[len - 1]);
        }
    }, 20);
}

// 结束游戏
function endGame() {
    if (isGameOver) return;

    isGameOver = true;
    clearInterval(timer);
    flag = false;

    // 停止背景音乐
    backgroundMusic.pause();

    // 更新结束界面数据
    document.getElementById('final-score').textContent = num;
    document.getElementById('final-highscore').textContent =
        document.getElementById('high-score').textContent;
    document.getElementById('final-playcount').textContent =
        document.getElementById('play-count').textContent;

    // 显示游戏结束界面
    showScreen('game-over-screen');

    // 如果已登录且不是游客则保存分数
    if (currentUser && !currentUser.isGuest) {
        saveScore(currentUser.username, num);
        updateProfile();
    }

    document.getElementById('go').style.display = 'block';
}

// 切换音效
function toggleSound() {
    soundEnabled = this.checked;
    saveSettings();
}

// 切换背景音乐
function toggleMusic() {
    musicEnabled = this.checked;
    if (musicEnabled && flag && !isGameOver) {
        backgroundMusic.play();
    } else {
        backgroundMusic.pause();
    }
    saveSettings();
}

// 改变游戏难度
function changeDifficulty() {
    switch (this.value) {
        case 'low':
            speed = 3;
            break;
        case 'medium':
            speed = 5;
            break;
        case 'high':
            speed = 8;
            break;
    }
    saveSettings();
}

// 加载用户设置
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('pianoSettings')) || {};
    soundEnabled = settings.soundEnabled !== undefined ? settings.soundEnabled : true;
    musicEnabled = settings.musicEnabled !== undefined ? settings.musicEnabled : true;
    document.getElementById('difficulty').value = settings.difficulty || 'medium';

    document.getElementById('sound-effects').checked = soundEnabled;
    document.getElementById('background-music').checked = musicEnabled;
    changeDifficulty.call(document.getElementById('difficulty'));
}

// 保存用户设置
function saveSettings() {
    const settings = {
        soundEnabled,
        musicEnabled,
        difficulty: document.getElementById('difficulty').value
    };
    localStorage.setItem('pianoSettings', JSON.stringify(settings));
}

// 显示特定界面
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

// 设置界面导航
function setupNavigation() {
    // 登录界面按钮
    document.getElementById('show-rules').addEventListener('click', function () {
        showScreen('rules-screen');
    });

    // 游戏内按钮
    document.getElementById('settings-btn').addEventListener('click', function () {
        showScreen('settings-screen');
    });

    document.getElementById('profile-btn').addEventListener('click', function () {
        updateProfile();
        showScreen('profile-screen');
    });

    document.getElementById('leaderboard-btn').addEventListener('click', function () {
        updateLeaderboard();
        showScreen('leaderboard-screen');
    });

    // 返回按钮
    document.getElementById('back-to-login').addEventListener('click', function () {
        showScreen('login-screen');
    });

    document.getElementById('back-to-game').addEventListener('click', function () {
        showScreen('game-screen');
    });

    document.getElementById('back-to-game2').addEventListener('click', function () {
        showScreen('game-screen');
    });

    document.getElementById('back-to-game3').addEventListener('click', function () {
        showScreen('game-screen');
    });

    // 保存设置按钮
    document.getElementById('save-settings').addEventListener('click', function () {
        saveSettings();
        alert('设置已保存！');
        showScreen('game-screen');
    });
}

// 添加按钮事件监听
function setupGameOverButtons() {
    document.getElementById('play-again-btn').addEventListener('click', function () {
        startGame();
        showScreen('game-screen');
    });

    document.getElementById('view-profile-btn').addEventListener('click', function () {
        updateProfile();
        showScreen('profile-screen');
    });

    document.getElementById('view-leaderboard-btn').addEventListener('click', function () {
        updateLeaderboard();
        showScreen('leaderboard-screen');
    });
}

// 添加头像上传处理函数
function setupAvatarUpload() {
    const avatarUpload = document.getElementById('avatar-upload');
    const profileAvatar = document.getElementById('profile-avatar');
    const userAvatar = document.getElementById('user-avatar');

    avatarUpload.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            alert('请选择图片文件！');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            const avatarUrl = event.target.result;

            // 更新显示的avatar
            profileAvatar.src = avatarUrl;
            userAvatar.src = avatarUrl;

            // 如果是登录用户，保存到本地存储
            if (currentUser && !currentUser.isGuest) {
                saveAvatar(currentUser.username, avatarUrl);
            } else {
                // 游客模式临时保存，刷新后失效
                currentUser.avatar = avatarUrl;
            }
        };
        reader.readAsDataURL(file);
    });
}

// 保存头像到本地存储
function saveAvatar(username, avatarUrl) {
    const users = JSON.parse(localStorage.getItem('pianoUsers')) || {};

    if (!users[username]) {
        users[username] = {
            highScore: 0,
            playCount: 0,
            totalScore: 0,
            isGuest: false
        };
    }

    users[username].avatar = avatarUrl;
    localStorage.setItem('pianoUsers', JSON.stringify(users));

    // 更新当前用户
    currentUser.avatar = avatarUrl;
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', initGame);

// 更新分数显示
function updateScoreDisplay() {
    document.getElementById('score').textContent = num;
    if (num % 10 === 0) {
        speed++;
    }
}

// 更新错误显示
function updateErrorDisplay() {
    document.getElementById('errors').textContent = `${errorCount}/${maxErrors}`;
}

// 播放错误音效
function playWrongSound() {
    if (soundEnabled) {
        wrongSound.currentTime = 0;
        wrongSound.play();
    }
}

// 移动所有行
function moveRows() {
    const rows = main.childNodes;
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const currentTop = parseInt(row.style.top) || 0;
        row.style.top = (currentTop + speed) + 'px';
    }
}

// 检查游戏结束条件
function checkGameOverCondition() {
    if (errorCount >= maxErrors) {
        endGame();
    }
}

// 移动方块的逻辑
function moveBlocks() {
    const blocks = main.querySelectorAll('.i');
    blocks.forEach(block => {
        const currentTop = parseInt(block.style.top) || 0;
        block.style.top = (currentTop + speed) + 'px';
    });
}