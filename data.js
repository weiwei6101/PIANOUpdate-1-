// 分数和用户数据处理
function saveScore(username, score) {
    const users = JSON.parse(localStorage.getItem('pianoUsers')) || {};
    
    if (!users[username]) {
        users[username] = {
            highScore: 0,
            playCount: 0,
            totalScore: 0,
            isGuest: username === '游客'  // 标记是否为游客
        };
    }

    // 如果是游客，不保存分数
    if (users[username].isGuest) {
        return;
    }
    
    const user = users[username];
    user.playCount++;
    user.totalScore += score;
    
    if (score > user.highScore) {
        user.highScore = score;
    }
    
    localStorage.setItem('pianoUsers', JSON.stringify(users));
    updateLeaderboard();
}

function updateProfile() {
    if (!currentUser || currentUser.isGuest) return;
    
    const users = JSON.parse(localStorage.getItem('pianoUsers')) || {};
    const user = users[currentUser.username];
    
    if (user) {
        document.getElementById('high-score').textContent = user.highScore;
        document.getElementById('play-count').textContent = user.playCount;
        document.getElementById('total-score').textContent = user.totalScore;
    }
}

function updateLeaderboard() {
    const users = JSON.parse(localStorage.getItem('pianoUsers')) || {};
    const leaderboard = document.getElementById('score-table').querySelector('tbody');
    leaderboard.innerHTML = '';
    
    // 将用户对象转换为数组并按最高分排序
    const sortedUsers = Object.entries(users)
        .map(([username, data]) => ({ username, ...data }))
        .filter(user => !user.isGuest)  // 过滤掉游客
        .sort((a, b) => b.highScore - a.highScore)
        .slice(0, 10); // 前10名
    
    sortedUsers.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.username}</td>
            <td>${user.highScore}</td>
        `;
        leaderboard.appendChild(row);
    });
}

// 页面加载时初始化排行榜
document.addEventListener('DOMContentLoaded', updateLeaderboard);