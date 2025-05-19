// Ждем инициализации Firebase
function waitForFirebase() {
    return new Promise((resolve) => {
        const check = () => {
            if (window.db && window.doc && window.setDoc && window.getDoc) {
                const { db, doc, setDoc, getDoc } = window;
                resolve({ db, doc, setDoc, getDoc });
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });
}

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

// Объект для хранения пресетов
let presets = {
    trainingDay: {
        protein: 0,
        carbs: 0,
        fats: 0,
        calories: 0
    },
    restDay: {
        protein: 0,
        carbs: 0,
        fats: 0,
        calories: 0
    }
};

// Текущий редактируемый пресет
let currentEditingPreset = null;

// Глобальные переменные для Firebase
let db, doc, setDoc, getDoc;

// Флаг для отслеживания инициализации
let isInitialized = false;

// Функция показа/скрытия индикатора загрузки
function setLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'flex' : 'none';
    }
}

// Функция определения операционной системы
function getOperatingSystem() {
    const userAgent = window.navigator.userAgent;
    const platform = window.navigator.platform;
    const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
    const iosPlatforms = ['iPhone', 'iPad', 'iPod'];
    
    if (macosPlatforms.indexOf(platform) !== -1) {
        return 'MacOS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        return 'iOS';
    } else if (platform.indexOf('Win') !== -1) {
        return 'Windows';
    } else if (/Android/.test(userAgent)) {
        return 'Android';
    } else if (/Linux/.test(platform)) {
        return 'Linux';
    }
    
    return 'Unknown';
}

// Функция сохранения данных в Firebase
async function saveToFirebase() {
    if (!isInitialized) return;
    
    try {
        const userDoc = doc(db, 'users', 'current_user');
        await setDoc(userDoc, {
            dailyGoals,
            consumed,
            presets,
            lastUpdated: new Date().toISOString(),
            system: getOperatingSystem(),
            userAgent: window.navigator.userAgent
        }, { merge: true });
        console.log('Данные сохранены в Firebase');
    } catch (error) {
        console.error('Ошибка при сохранении в Firebase:', error);
        throw error;
    }
}

// Функция загрузки данных из Firebase
async function loadFromFirebase() {
    try {
        const userDoc = doc(db, 'users', 'current_user');
        const docSnap = await getDoc(userDoc);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            if (data.dailyGoals) {
                Object.assign(dailyGoals, data.dailyGoals);
            }
            
            if (data.consumed) {
                Object.assign(consumed, data.consumed);
            }
            
            if (data.presets) {
                Object.assign(presets, data.presets);
                // Обновляем текст кнопок пресетов с актуальными значениями
                updatePresetButtonText();
            }
            
            console.log('Данные загружены из Firebase');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Ошибка при загрузке из Firebase:', error);
        throw error;
    }
}

// Функция обновления прогресс-баров
function updateProgress() {
    console.log('updateProgress вызвана');
    
    // Обновляем прогресс белков
    if (dailyGoals.protein > 0) {
        const proteinPercentage = (consumed.protein / dailyGoals.protein) * 100;
        const proteinRemaining = dailyGoals.protein - consumed.protein;
        document.getElementById('protein-progress').style.width = `${Math.min(proteinPercentage, 100)}%`;
        document.getElementById('protein-text').innerHTML = 
            `${consumed.protein}/${dailyGoals.protein} г (${Math.round(proteinPercentage)}%) <br><strong>Осталось: ${proteinRemaining} г</strong>`;
    }

    // Обновляем прогресс углеводов
    if (dailyGoals.carbs > 0) {
        const carbsPercentage = (consumed.carbs / dailyGoals.carbs) * 100;
        const carbsRemaining = dailyGoals.carbs - consumed.carbs;
        document.getElementById('carbs-progress').style.width = `${Math.min(carbsPercentage, 100)}%`;
        document.getElementById('carbs-text').innerHTML = 
            `${consumed.carbs}/${dailyGoals.carbs} г (${Math.round(carbsPercentage)}%) <br><strong>Осталось: ${carbsRemaining} г</strong>`;
    }

    // Обновляем прогресс жиров
    if (dailyGoals.fats > 0) {
        const fatsPercentage = (consumed.fats / dailyGoals.fats) * 100;
        const fatsRemaining = dailyGoals.fats - consumed.fats;
        document.getElementById('fats-progress').style.width = `${Math.min(fatsPercentage, 100)}%`;
        document.getElementById('fats-text').innerHTML = 
            `${consumed.fats}/${dailyGoals.fats} г (${Math.round(fatsPercentage)}%) <br><strong>Осталось: ${fatsRemaining} г</strong>`;
    }

    // Обновляем прогресс калорий
    if (dailyGoals.calories > 0) {
        const caloriesPercentage = (consumed.calories / dailyGoals.calories) * 100;
        const caloriesRemaining = dailyGoals.calories - consumed.calories;
        document.getElementById('calories-progress').style.width = `${Math.min(caloriesPercentage, 100)}%`;
        document.getElementById('calories-text').innerHTML = 
            `${consumed.calories}/${dailyGoals.calories} ккал (${Math.round(caloriesPercentage)}%) <br><strong>Осталось: ${caloriesRemaining} ккал</strong>`;
    }
}

// Функция добавления приема пищи
async function addMeal() {
    console.log('addMeal вызвана');
    
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
    await saveToFirebase();
}

// Функция сброса всех значений
async function resetAll() {
    if (!confirm('Вы уверены, что хотите сбросить все значения? Это действие нельзя отменить.')) {
        return;
    }
    
    console.log('resetAll вызвана');
    
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
    
    updateProgress();
    await saveToFirebase();
}

// Функция определения текущей темы
function getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

// Функция обновления текста на кнопках пресетов
function updatePresetButtonText() {
    const trainingDayBtn = document.getElementById('training-day-btn');
    const restDayBtn = document.getElementById('rest-day-btn');
    
    if (presets.trainingDay.protein > 0 || presets.trainingDay.carbs > 0 || presets.trainingDay.fats > 0) {
        trainingDayBtn.innerText = `Тренировочный день (Б: ${presets.trainingDay.protein}г, У: ${presets.trainingDay.carbs}г, Ж: ${presets.trainingDay.fats}г)`;
    } else {
        trainingDayBtn.innerText = 'Тренировочный день';
    }
    
    if (presets.restDay.protein > 0 || presets.restDay.carbs > 0 || presets.restDay.fats > 0) {
        restDayBtn.innerText = `День отдыха (Б: ${presets.restDay.protein}г, У: ${presets.restDay.carbs}г, Ж: ${presets.restDay.fats}г)`;
    } else {
        restDayBtn.innerText = 'День отдыха';
    }
}

// Функция применения пресета
function applyPreset(presetType) {
    if (presetType === 'trainingDay') {
        dailyGoals.protein = presets.trainingDay.protein;
        dailyGoals.carbs = presets.trainingDay.carbs;
        dailyGoals.fats = presets.trainingDay.fats;
    } else if (presetType === 'restDay') {
        dailyGoals.protein = presets.restDay.protein;
        dailyGoals.carbs = presets.restDay.carbs;
        dailyGoals.fats = presets.restDay.fats;
    }
    
    // Автоматический расчет калорий
    dailyGoals.calories = Math.round((dailyGoals.protein * 4) + (dailyGoals.carbs * 4) + (dailyGoals.fats * 9));
    
    // Сбрасываем потребленные значения при установке новых целей
    consumed.protein = 0;
    consumed.carbs = 0;
    consumed.fats = 0;
    consumed.calories = 0;
    
    updateProgress();
    saveToFirebase();
}

// Функция показа формы редактирования пресета
function showPresetEditForm(presetType) {
    currentEditingPreset = presetType;
    const presetEditForm = document.getElementById('preset-edit-form');
    const presetEditTitle = document.getElementById('preset-edit-title');
    
    let presetData;
    let titleText;
    
    if (presetType === 'trainingDay') {
        presetData = presets.trainingDay;
        titleText = 'Изменить пресет "Тренировочный день"';
    } else if (presetType === 'restDay') {
        presetData = presets.restDay;
        titleText = 'Изменить пресет "День отдыха"';
    }
    
    document.getElementById('preset-protein').value = presetData.protein || '';
    document.getElementById('preset-carbs').value = presetData.carbs || '';
    document.getElementById('preset-fats').value = presetData.fats || '';
    document.getElementById('preset-calories').value = presetData.calories || '';
    
    presetEditTitle.textContent = titleText;
    presetEditForm.style.display = 'block';
    presetEditForm.classList.remove('slideUp');
    
    // Автоматический расчет калорий при вводе БЖУ
    const proteinInput = document.getElementById('preset-protein');
    const carbsInput = document.getElementById('preset-carbs');
    const fatsInput = document.getElementById('preset-fats');
    const caloriesInput = document.getElementById('preset-calories');
    
    const calculateCalories = () => {
        const protein = Number(proteinInput.value) || 0;
        const carbs = Number(carbsInput.value) || 0;
        const fats = Number(fatsInput.value) || 0;
        const calories = Math.round((protein * 4) + (carbs * 4) + (fats * 9));
        caloriesInput.value = calories;
    };
    
    proteinInput.addEventListener('input', calculateCalories);
    carbsInput.addEventListener('input', calculateCalories);
    fatsInput.addEventListener('input', calculateCalories);
}

// Функция сохранения пресета
function savePreset() {
    const protein = Number(document.getElementById('preset-protein').value) || 0;
    const carbs = Number(document.getElementById('preset-carbs').value) || 0;
    const fats = Number(document.getElementById('preset-fats').value) || 0;
    const calories = Math.round((protein * 4) + (carbs * 4) + (fats * 9));
    
    if (currentEditingPreset === 'trainingDay') {
        presets.trainingDay = { protein, carbs, fats, calories };
    } else if (currentEditingPreset === 'restDay') {
        presets.restDay = { protein, carbs, fats, calories };
    }
    
    hidePresetEditForm();
    updatePresetButtonText();
    saveToFirebase();
}

// Функция скрытия формы редактирования пресета
function hidePresetEditForm() {
    const presetEditForm = document.getElementById('preset-edit-form');
    presetEditForm.classList.add('slideUp');
    
    // После завершения анимации скрываем форму
    setTimeout(() => {
        presetEditForm.style.display = 'none';
        presetEditForm.classList.remove('slideUp');
    }, 300);
    
    currentEditingPreset = null;
}

// Функция применения темы
function applyTheme(theme) {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
    
    // Обновляем информацию в интерфейсе
    const osType = document.getElementById('os-type');
    if (osType) {
        osType.textContent = `${getOperatingSystem()} (${theme})`;
    }
}

// Инициализация приложения
async function initApp() {
    setLoading(true);
    try {
        // Ждем инициализации Firebase
        const firebase = await waitForFirebase();
        ({ db, doc, setDoc, getDoc } = firebase);
        
        await loadFromFirebase();
        isInitialized = true;
        updateProgress();
        
        // Обновляем информацию об ОС и теме
        const currentTheme = getSystemTheme();
        applyTheme(currentTheme);
        
        // Добавляем слушатель изменения темы
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            const newTheme = e.matches ? 'dark' : 'light';
            applyTheme(newTheme);
        });
        
    } catch (error) {
        console.error('Ошибка при инициализации:', error);
        alert('Не удалось загрузить данные. Проверьте подключение к интернету.');
    } finally {
        setLoading(false);
    }
}

// Добавляем обработчики событий
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен');
    
    // Находим элементы в DOM
    const trainingDayBtn = document.getElementById('training-day-btn');
    const restDayBtn = document.getElementById('rest-day-btn');
    const editTrainingDayBtn = document.getElementById('edit-training-day');
    const editRestDayBtn = document.getElementById('edit-rest-day');
    const savePresetBtn = document.getElementById('save-preset-btn');
    const cancelPresetBtn = document.getElementById('cancel-preset-btn');
    const addMealBtn = document.getElementById('add-meal-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    console.log('Кнопки найдены:', { 
        trainingDayBtn,
        restDayBtn,
        editTrainingDayBtn,
        editRestDayBtn,
        savePresetBtn,
        cancelPresetBtn,
        addMealBtn,
        resetBtn 
    });
    
    // Инициализация приложения
    initApp();
    
    // Добавляем обработчики
    trainingDayBtn.addEventListener('click', () => applyPreset('trainingDay'));
    restDayBtn.addEventListener('click', () => applyPreset('restDay'));
    
    editTrainingDayBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Предотвращаем всплытие события клика
        showPresetEditForm('trainingDay');
    });
    
    editRestDayBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Предотвращаем всплытие события клика
        showPresetEditForm('restDay');
    });
    
    savePresetBtn.addEventListener('click', savePreset);
    cancelPresetBtn.addEventListener('click', hidePresetEditForm);
    
    addMealBtn.addEventListener('click', addMeal);
    resetBtn.addEventListener('click', resetAll);
});
