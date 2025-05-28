// 认证处理
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const anonymousBtn = document.getElementById('anonymous-play');
    const loginBtn = document.getElementById('login-play');
    const loginForm = document.getElementById('login-form');
    const submitLogin = document.getElementById('submit-login');
    const usernameInput = document.getElementById('username');

    // 事件监听
    anonymousBtn.addEventListener('click', playAsGuest);
    loginBtn.addEventListener('click', showLoginForm);
    submitLogin.addEventListener('click', handleLogin);

    // 游客模式
    function playAsGuest() {
        currentUser = {
            username: '游客',
            avatar: 'default-avatar.png',
            isGuest: true
        };
        updateUserDisplay();
        showScreen('game-screen');
    }

    // 显示登录表单
    function showLoginForm() {
        loginForm.classList.toggle('hidden');
    }

    // 处理登录
    function handleLogin() {
        const username = usernameInput.value.trim();

        if (!username) {
            alert('请输入用户名！');
            return;
        }

        // 在实际应用中，这里应该验证服务器端的凭证
        currentUser = {
            username,
            isGuest: false,
            avatar: 'default-avatar.png' // 为新用户设置默认头像
        };

        // 加载用户数据
        loadUserData(username);
        
        updateUserDisplay();
        showScreen('game-screen');
    }

    // 更新用户显示
    function updateUserDisplay() {
        document.getElementById('username-display').textContent = currentUser.username;
        document.getElementById('profile-username').textContent = currentUser.username;

        //更新头像显示
        const avatar = currentUser.avatar || 'default-avatar.png';
        document.getElementById('user-avatar').src = currentUser.avatar;
        document.getElementById('profile-avatar').src = currentUser.avatar;
    }
});
// 获取默认头像URL
function getDefaultAvatarUrl() {
    return 'default-avatar.png';
    
}

// 加载用户数据
function loadUserData(username) {
    const users = JSON.parse(localStorage.getItem('pianoUsers')) || {};
    const userData = users[username] || {
        highScore: 0,
        playCount: 0,
        totalScore: 0,
        isGuest:false,
        avatar:getDefaultAvatarUrl() //确保新用户有默认头像
    };
    
    document.getElementById('high-score').textContent = userData.highScore;
    document.getElementById('play-count').textContent = userData.playCount;
    document.getElementById('total-score').textContent = userData.totalScore;
}