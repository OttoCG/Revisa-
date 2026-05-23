// Sistema de Gerenciamento de Usuário e Leveling - Otto

const defaultUser = {
    name: '',
    level: 1,
    currentXP: 0,
    totalXP: 0,
    createdAt: new Date().toISOString(),
    // novos campos de estatísticas
    streakDays: 0,
    exercisesCompleted: 0,
    reviews: {
        totalReviews: 0,
        totalCorrect: 0
    },
    biography: '',
    email: '',
    // histórico de avaliações
    assessments: []
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
        streakDays: user.streakDays || 0,
        exercisesCompleted: user.exercisesCompleted || 0,
        reviews: user.reviews || { totalReviews: 0, totalCorrect: 0 },
        biography: user.biography || '',
        email: user.email || '',
        xpForNextLevel: xpNeeded,
        createdAt: user.createdAt
    };
}

// Biografia editável
function setBiography(text) {
    const user = getCurrentUser();
    if (!user) return false;
    user.biography = text || '';
    saveUser(user);
    return true;
}

function setEmail(email) {
    const user = getCurrentUser();
    if (!user) return false;
    user.email = email || '';
    saveUser(user);
    return true;
}

function getUserStats() {
    const user = getCurrentUser();
    if (!user) return null;
    const reviews = user.reviews || { totalReviews: 0, totalCorrect: 0 };
    const avgCorrect = reviews.totalReviews === 0 ? 0 : (reviews.totalCorrect / reviews.totalReviews) * 100;
    return {
        streakDays: user.streakDays || 0,
        exercisesCompleted: user.exercisesCompleted || 0,
        avgCorrectPercent: avgCorrect,
        biography: user.biography || ''
    };
}

// Funções utilitárias para atualizar estatísticas
function addExercises(count = 1) {
    const user = getCurrentUser();
    if (!user) return false;
    user.exercisesCompleted = (user.exercisesCompleted || 0) + Math.max(0, count);
    saveUser(user);
    return true;
}

function recordReview(correct, total) {
    const user = getCurrentUser();
    if (!user) return false;
    user.reviews = user.reviews || { totalReviews: 0, totalCorrect: 0 };
    user.reviews.totalReviews += Math.max(0, total || 0);
    user.reviews.totalCorrect += Math.max(0, correct || 0);
    // também registra a avaliação no histórico
    user.assessments = user.assessments || [];
    const score = (total && total > 0) ? Math.round((correct / total) * 100) : 0;
    user.assessments.push({
        date: new Date().toISOString(),
        correct: Number(correct) || 0,
        total: Number(total) || 0,
        scorePercent: score
    });
    saveUser(user);
    return true;
}

function addAssessment(correct, total) {
    const user = getCurrentUser();
    if (!user) return false;
    user.assessments = user.assessments || [];
    const score = (total && total > 0) ? Math.round((correct / total) * 100) : 0;
    const assessment = { date: new Date().toISOString(), correct: Number(correct) || 0, total: Number(total) || 0, scorePercent: score };
    user.assessments.push(assessment);
    saveUser(user);
    return assessment;
}

function getAssessments() {
    const user = getCurrentUser();
    if (!user) return [];
    return user.assessments || [];
}

// Fazer logout (remover usuário)
function logout() {
    localStorage.removeItem('revistaUser');
}

// Verificar se usuário está logado
function isUserLoggedIn() {
    return getCurrentUser() !== null;
}
