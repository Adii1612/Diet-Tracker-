class DietTracker {
    constructor(dailyGoal = 2000) {

        this.dailyGoal = localStorage.getItem("goal") || dailyGoal;

        this.user = localStorage.getItem("user");

        if (!this.user) {
            window.location.href = "login.html";
            return;
        }

        this.entries = JSON.parse(localStorage.getItem(this.user)) || [];

        document.querySelectorAll("#user-name").forEach(el => {
            el.innerText = this.user;
        });

        this.init();
        this.loadTheme();
    }

    init() {
        document.getElementById('diet-form')
            .addEventListener('submit', (e) => this.handleAddEntry(e));

        document.getElementById('date-display').innerText =
            new Date().toLocaleDateString();

        this.render();
    }

    handleAddEntry(e) {
        e.preventDefault();

        const name = document.getElementById('meal-name').value.trim();
        const calories = parseInt(document.getElementById('meal-calories').value);
        const protein = parseInt(document.getElementById('protein').value) || 0;
        const carbs = parseInt(document.getElementById('carbs').value) || 0;
        const fat = parseInt(document.getElementById('fat').value) || 0;

        if (!name || isNaN(calories)) {
            alert("Enter valid data");
            return;
        }

        const entry = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            timestamp: new Date().toLocaleTimeString(),
            name,
            calories,
            protein,
            carbs,
            fat
        };

        this.entries.push(entry);
        this.saveAndRender();
        e.target.reset();
    }

    deleteEntry(id) {
        this.entries = this.entries.filter(e => e.id !== id);
        this.saveAndRender();
    }

    saveAndRender() {
        localStorage.setItem(this.user, JSON.stringify(this.entries));
        this.render();
    }

    render() {
        const tbody = document.getElementById('journal-body');
        const totalCalsElement = document.getElementById('total-cals');
        const progressBar = document.getElementById('progress-bar');
        const progressPercent = document.getElementById('progress-percent');

        let total = 0;
        tbody.innerHTML = '';

        const search = document.getElementById("search").value.toLowerCase();

        this.entries
            .filter(e => e.name.toLowerCase().includes(search))
            .forEach(entry => {
                total += entry.calories;

                tbody.innerHTML += `
                    <tr>
                        <td>${entry.timestamp}</td>
                        <td>${entry.name}</td>
                        <td>${entry.calories}</td>
                        <td><button onclick="app.deleteEntry(${entry.id})">Delete</button></td>
                    </tr>
                `;
            });

        totalCalsElement.innerText = total;

        const percent = Math.min((total / this.dailyGoal) * 100, 100);
        progressBar.style.width = percent + "%";
        progressPercent.innerText = Math.round(percent) + "%";

        let message = "";

        if(total < this.dailyGoal){
            message = "You can eat more today 👍";
        } else if(total > this.dailyGoal){
            message = "You exceeded your goal ⚠️";
        } else {
            message = "Perfect diet balance 🔥";
        }

        document.getElementById("insight").innerText = message;
    }

    loadTheme() {
        let theme = localStorage.getItem("theme");
        if (theme === "dark") {
            document.body.classList.add("dark-mode");
        }
    }
}



/* ==============================
   RECOMMENDED MEAL DATA
=================================*/
const recommendedMeals = [
    { name: "Oats + Milk + Banana", protein: 13, calories: 410, carbs: 70, fat: 9 },
    { name: "3 Egg Omelette", protein: 18, calories: 210, carbs: 2, fat: 15 },
    { name: "Peanut Butter Sandwich", protein: 10, calories: 245, carbs: 31, fat: 10 },
    { name: "Chicken + Rice + Salad", protein: 37, calories: 440, carbs: 39, fat: 5 },
    { name: "Paneer + Roti + Sabzi", protein: 26, calories: 515, carbs: 41, fat: 26 },
    { name: "Dal + Rice + Eggs", protein: 25, calories: 460, carbs: 56, fat: 14 },
    { name: "Fruit Bowl", protein: 2, calories: 150, carbs: 35, fat: 1 },
    { name: "Sprouts Salad", protein: 12, calories: 120, carbs: 18, fat: 1 },
    { name: "Curd + Honey", protein: 5, calories: 111, carbs: 13, fat: 3 },
    { name: "Grilled Chicken + Veggies", protein: 28, calories: 230, carbs: 10, fat: 3 },
    { name: "Paneer Bhurji + Roti", protein: 17, calories: 300, carbs: 22, fat: 17 },
    { name: "Dal + Egg Bhurji", protein: 21, calories: 310, carbs: 22, fat: 14 },
    { name: "Boiled Egg", protein: 6, calories: 70, carbs: 1, fat: 5 },
    { name: "Milk Glass", protein: 6, calories: 120, carbs: 10, fat: 5 },
    { name: "Soya Chunks (30g)", protein: 14, calories: 140, carbs: 9, fat: 1 }
];

function renderRecommendedMeals() {
    const tbody = document.getElementById("meal-list");
    tbody.innerHTML = "";

    recommendedMeals.forEach((m) => {
        tbody.innerHTML += `
            <tr>
                <td>${m.name}</td>
                <td>${m.protein}g</td>
                <td>${m.calories}</td>
                <td>${m.carbs}g</td>
                <td>${m.fat}g</td>
                <td>
                    <button onclick="addRecommendedMeal('${m.name}', ${m.calories}, ${m.protein}, ${m.carbs}, ${m.fat})">
                        Add
                    </button>
                </td>
            </tr>
        `;
    });
}

function addRecommendedMeal(name, calories, protein, carbs, fat) {
    const entry = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        timestamp: new Date().toLocaleTimeString(),
        name,
        calories,
        protein,
        carbs,
        fat
    };

    app.entries.push(entry);
    app.saveAndRender();

    alert(name + " added to your journal!");
}



/* ==============================
   ANALYSIS TAB — FIXED CHART
=================================*/
function loadChart() {

    // PREVENT DUPLICATE CHARTS
    let existing = Chart.getChart("calorieChart");
    if (existing) existing.destroy();

    const user = localStorage.getItem("user");
    const data = JSON.parse(localStorage.getItem(user)) || [];

    let totals = {};

    data.forEach(e => {
        let d = e.date;
        totals[d] = (totals[d] || 0) + e.calories;
    });

    const ctx = document.getElementById("calorieChart");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: Object.keys(totals),
            datasets: [{
                label: "Calories",
                data: Object.values(totals)
            }]
        }
    });
}



/* ==============================
   TAB HANDLER (WITH FIX)
=================================*/
function showTab(tabId){
    document.querySelectorAll('.tab').forEach(t => t.style.display="none");
    document.getElementById(tabId).style.display="block";

    if (tabId === "analysis") {
        setTimeout(() => loadChart(), 200);
    }

    if(tabId === "meals"){
        renderRecommendedMeals();
    }
}



/* ==============================
   GOAL SAVE
=================================*/
function saveGoal(){
    let g = document.getElementById("goal-input").value;
    if(g){
        localStorage.setItem("goal", g);
        alert("Saved!");
        location.reload();
    }
}



/* ==============================
   EXPORT REPORT
=================================*/
function downloadReport(){
    let user = localStorage.getItem("user");
    let data = localStorage.getItem(user);

    let blob = new Blob([data], {type:"application/json"});
    let a = document.createElement("a");

    a.href = URL.createObjectURL(blob);
    a.download = "diet.json";
    a.click();
}



/* ==============================
   DARK MODE
=================================*/
function toggleDarkMode(){
    document.body.classList.toggle("dark-mode");

    if(document.body.classList.contains("dark-mode")){
        localStorage.setItem("theme","dark");
    } else {
        localStorage.setItem("theme","light");
    }
}



/* ==============================
   INIT APP
=================================*/
const app = new DietTracker(2500);