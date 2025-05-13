// Инициализация объектов для хранения целей и потребленных значений
let dailyGoals = {
    protein: 0,
    carbs: 0,
    fats: 0,
    calories: 0
};

let consumed = {
    protein: 0,
    carbs: 0,
    fats: 0,
    calories: 0
};

// Функция установки дневных целей
function setDailyGoals() {
    console.log('setDailyGoals вызвана'); // Для отладки
    
    // Получаем значения из полей ввода
    dailyGoals.protein = Number(document.getElementById('protein-goal').value) || 0;
    dailyGoals.carbs = Number(document.getElementById('carbs-goal').value) || 0;
    dailyGoals.fats = Number(document.getElementById('fats-goal').value) || 0;
    
    // Автоматический расчет калорий
    dailyGoals.calories = Math.round((dailyGoals.protein * 4) + (dailyGoals.carbs * 4) + (dailyGoals.fats * 9));
    document.getElementById('calories-goal').value = dailyGoals.calories;
    
    // Сбрасываем потребленные калории при установке новых целей
    consumed.calories = 0;
    
    updateProgress();
}

// Функция добавления приема пищи
function addMeal() {
    console.log('addMeal вызвана'); // Для отладки
    
    // Получаем значения из полей ввода
    const protein = Number(document.getElementById('protein-consumed').value) || 0;
    const carbs = Number(document.getElementById('carbs-consumed').value) || 0;
    const fats = Number(document.getElementById('fats-consumed').value) || 0;
    
    // Обновляем потребленные значения
    consumed.protein += protein;
    consumed.carbs += carbs;
    consumed.fats += fats;
    consumed.calories = Math.round((consumed.protein * 4) + (consumed.carbs * 4) + (consumed.fats * 9));
    
    // Очищаем поля ввода
    document.getElementById('protein-consumed').value = '';
    document.getElementById('carbs-consumed').value = '';
    document.getElementById('fats-consumed').value = '';
    
    updateProgress();
}

// Функция обновления прогресс-баров
function updateProgress() {
    console.log('updateProgress вызвана'); // Для отладки
    
    // Обновляем прогресс белков
    const proteinPercentage = (consumed.protein / dailyGoals.protein) * 100;
    const proteinRemaining = dailyGoals.protein - consumed.protein;
    document.getElementById('protein-progress').style.width = `${Math.min(proteinPercentage, 100)}%`;
    document.getElementById('protein-text').innerHTML = 
        `${consumed.protein}/${dailyGoals.protein} г (${Math.round(proteinPercentage)}%) <br><strong>Осталось: ${proteinRemaining} г</strong>`;

    // Обновляем прогресс углеводов
    const carbsPercentage = (consumed.carbs / dailyGoals.carbs) * 100;
    const carbsRemaining = dailyGoals.carbs - consumed.carbs;
    document.getElementById('carbs-progress').style.width = `${Math.min(carbsPercentage, 100)}%`;
    document.getElementById('carbs-text').innerHTML = 
        `${consumed.carbs}/${dailyGoals.carbs} г (${Math.round(carbsPercentage)}%) <br><strong>Осталось: ${carbsRemaining} г</strong>`;

    // Обновляем прогресс жиров
    const fatsPercentage = (consumed.fats / dailyGoals.fats) * 100;
    const fatsRemaining = dailyGoals.fats - consumed.fats;
    document.getElementById('fats-progress').style.width = `${Math.min(fatsPercentage, 100)}%`;
    document.getElementById('fats-text').innerHTML = 
        `${consumed.fats}/${dailyGoals.fats} г (${Math.round(fatsPercentage)}%) <br><strong>Осталось: ${fatsRemaining} г</strong>`;

    // Обновляем прогресс калорий
    const caloriesPercentage = (consumed.calories / dailyGoals.calories) * 100;
    const caloriesRemaining = dailyGoals.calories - consumed.calories;
    document.getElementById('calories-progress').style.width = `${Math.min(caloriesPercentage, 100)}%`;
    document.getElementById('calories-text').innerHTML = 
        `${consumed.calories}/${dailyGoals.calories} ккал (${Math.round(caloriesPercentage)}%) <br><strong>Осталось: ${caloriesRemaining} ккал</strong>`;
}

// Функция сброса всех значений
function resetAll() {
    console.log('resetAll вызвана'); // Для отладки
    
    // Сбрасываем цели
    dailyGoals = {
        protein: 0,
        carbs: 0,
        fats: 0,
        calories: 0
    };
    
    // Сбрасываем потребленные значения
    consumed = {
        protein: 0,
        carbs: 0,
        fats: 0,
        calories: 0
    };
    
    // Очищаем поля ввода целей
    document.getElementById('protein-goal').value = '';
    document.getElementById('carbs-goal').value = '';
    document.getElementById('fats-goal').value = '';
    document.getElementById('calories-goal').value = '';
    
    // Очищаем поля ввода потребления
    document.getElementById('protein-consumed').value = '';
    document.getElementById('carbs-consumed').value = '';
    document.getElementById('fats-consumed').value = '';
    
    // Обновляем прогресс-бары
    updateProgress();
}

// Добавляем обработчики событий
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен'); // Для отладки
    
    const setGoalsBtn = document.getElementById('set-goals-btn');
    const addMealBtn = document.getElementById('add-meal-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    console.log('Кнопки найдены:', { setGoalsBtn, addMealBtn, resetBtn }); // Для отладки
    
    setGoalsBtn.addEventListener('click', setDailyGoals);
    addMealBtn.addEventListener('click', addMeal);
    resetBtn.addEventListener('click', resetAll);
});
// Функция сохранения данных в Firebase
async function saveToFirebase() {
    try {
        const userDoc = doc(db, 'users', 'current_user');
        await setDoc(userDoc, {
            dailyGoals,
            consumed,
            lastUpdated: new Date().toISOString()
        });
        console.log('Данные сохранены в Firebase');
    } catch (error) {
        console.error('Ошибка при сохранении в Firebase:', error);
    }
}

// Функция загрузки данных из Firebase
async function loadFromFirebase() {
    try {
        const userDoc = doc(db, 'users', 'current_user');
        const docSnap = await getDoc(userDoc);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            dailyGoals = data.dailyGoals || dailyGoals;
            consumed = data.consumed || consumed;
            
            // Обновляем поля ввода
            document.getElementById('protein-goal').value = dailyGoals.protein;
            document.getElementById('carbs-goal').value = dailyGoals.carbs;
            document.getElementById('fats-goal').value = dailyGoals.fats;
            document.getElementById('calories-goal').value = dailyGoals.calories;
            
            // Обновляем прогресс-бары
            updateProgress();
            console.log('Данные загружены из Firebase');
        }
    } catch (error) {
        console.error('Ошибка при загрузке из Firebase:', error);
    }
}

// Обновляем существующие функции, добавляя сохранение в Firebase
function setDailyGoals() {
    // ... существующий код ...
    saveToFirebase(); // Добавляем сохранение
}

function addMeal() {
    // ... существующий код ...
    saveToFirebase(); // Добавляем сохранение
}

function resetAll() {
    // ... существующий код ...
    saveToFirebase(); // Добавляем сохранение
}

// Обновляем обработчик DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен');
    
    const setGoalsBtn = document.getElementById('set-goals-btn');
    const addMealBtn = document.getElementById('add-meal-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    setGoalsBtn.addEventListener('click', setDailyGoals);
    addMealBtn.addEventListener('click', addMeal);
    resetBtn.addEventListener('click', resetAll);
    
    // Загружаем данные при загрузке страницы
    loadFromFirebase();
});
