// Sistema de Gerenciamento de Usuário e Leveling - Otto

const defaultUser = {
    name: '',
    level: 1,
    currentXP: 0,
    totalXP: 0,
    createdAt: new Date().toISOString()
};

// Função para calcular XP necessário para atingir um nível
// Nível 1: 0 XP
// Nível 2: 500 XP
// Nível 3: 1500 XP (500 + 1000)
// Nível 4: 3000 XP (500 + 1000 + 1500)
// Progressão: começa em 500 e aumenta 500 por nível - Otto
function calculateXPForLevel(level) {
    if (level <= 1) return 0;
    
    let totalXP = 0;
    for (let i = 2; i <= level; i++) {
        totalXP += 500 * (i - 1);
    }
    return totalXP;
}

// Obter usuário do localStorage
function getCurrentUser() {
    const userJSON = localStorage.getItem('revistaUser');
    if (userJSON) {
        return JSON.parse(userJSON);
    }
    return null;
}

// Salvar usuário no localStorage
function saveUser(user) {
    localStorage.setItem('revistaUser', JSON.stringify(user));
}

// Criar novo usuário
function createUser(name) {
    if (!name || name.trim() === '') {
        return false;
    }
    
    const newUser = {
        ...defaultUser,
        name: name.trim()
    };
    
    saveUser(newUser);
    return true;
}

// Adicionar XP ao usuário
function addXP(amount) {
    const user = getCurrentUser();
    if (!user) return false;
    
    const levelBefore = user.level;
    user.currentXP += amount;
    user.totalXP += amount;
    
// Verificar avanço de nível
    while (user.currentXP >= calculateXPForLevel(user.level + 1)) {
        const xpNeeded = calculateXPForLevel(user.level + 1);
        user.currentXP -= xpNeeded;
        user.level += 1;
    }
    
    saveUser(user);
    
    return {
        leveledUp: user.level > levelBefore,
        newLevel: user.level,
        levelBefore: levelBefore,
        currentXP: user.currentXP,
        xpForNextLevel: calculateXPForLevel(user.level + 1)
    };
}

// Obter progresso de XP para o próximo nível
function getXPProgress() {
    const user = getCurrentUser();
    if (!user) return null;
    
    const xpNeeded = calculateXPForLevel(user.level + 1);
    const xpStart = calculateXPForLevel(user.level);
    const xpInCurrentLevel = xpNeeded - xpStart;
    const xpCurrentProgress = user.currentXP;
    const progressPercentage = (xpCurrentProgress / xpInCurrentLevel) * 100;
    
    return {
        level: user.level,
        currentXP: user.currentXP,
        xpNeeded: xpNeeded,
        xpForNextLevel: xpInCurrentLevel,
        progressPercentage: progressPercentage,
        totalXP: user.totalXP
    };
}

// Obter informações do usuário formatadas
function getUserInfo() {
    const user = getCurrentUser();
    if (!user) return null;
    
    const xpNeeded = calculateXPForLevel(user.level + 1);
    
    return {
        name: user.name,
        level: user.level,
        currentXP: user.currentXP,
        totalXP: user.totalXP,
        xpForNextLevel: xpNeeded,
        createdAt: user.createdAt
    };
}

// Fazer logout (remover usuário)
function logout() {
    localStorage.removeItem('revistaUser');
}

// Verificar se usuário está logado
function isUserLoggedIn() {
    return getCurrentUser() !== null;
}
