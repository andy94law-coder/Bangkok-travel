// 初始設定
let expenses = JSON.parse(localStorage.getItem('tripExpenses')) || [];
// ⚠️ 請在這裡手動修改參與者名單
const participants = ['A', 'B', 'C', 'D', 'E']; 
const participantNames = {
    'A': 'Andy', 
    'B': 'Coco',
    'C': 'Pei',
    'D': 'Jie',
    'E': 'Tina'
};

// 頁面載入時執行初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化付款人和參與者的選項
    initializeParticipants();
    renderSummary();
    renderExpenseList();
});


// 1. 初始化 Select 和 Checkbox
function initializeParticipants() {
    const paidBySelect = document.getElementById('expense-paid-by');
    const checkboxesDiv = document.getElementById('participants-checkboxes');
    paidBySelect.innerHTML = '';
    checkboxesDiv.innerHTML = '';

    participants.forEach(id => {
        const name = participantNames[id];
        
        // 設置付款人 Select
        const option = document.createElement('option');
        option.value = id;
        option.textContent = name;
        paidBySelect.appendChild(option);

        // 設置參與者 Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `check-${id}`;
        checkbox.value = id;
        checkbox.checked = true; // 預設所有人都參與
        
        const label = document.createElement('label');
        label.htmlFor = `check-${id}`;
        label.style.display = 'inline';
        label.textContent = name;

        checkboxesDiv.appendChild(checkbox);
        checkboxesDiv.appendChild(label);
        checkboxesDiv.appendChild(document.createElement('br'));
    });
}


// 2. 新增開銷 (處理參與者)
function addExpense() {
    const description = document.getElementById('expense-description').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const paidBy = document.getElementById('expense-paid-by').value;
    
    // 獲取選定的參與者
    const selectedParticipants = Array.from(document.querySelectorAll('#participants-checkboxes input:checked'))
                                      .map(checkbox => checkbox.value);
    
    if (!description || isNaN(amount) || amount <= 0 || selectedParticipants.length === 0) {
        alert('請輸入有效的金額並至少選擇一位參與者！');
        return;
    }

    const shareCount = selectedParticipants.length;
    const sharePerPerson = amount / shareCount; // 計算實際分攤金額

    const newExpense = {
        id: Date.now(),
        description: description,
        amount: amount,
        paidBy: paidBy,
        participants: selectedParticipants, // 記錄是誰參與了
        sharePerPerson: sharePerPerson 
    };

    expenses.push(newExpense);
    saveExpenses();
    renderSummary();
    renderExpenseList();

    // 清空輸入框並重置參與者選項為全選
    document.getElementById('expense-description').value = '';
    document.getElementById('expense-amount').value = '';
    document.querySelectorAll('#participants-checkboxes input').forEach(cb => cb.checked = true);
}


// 3. 計算並渲染總結 (複雜結算邏輯)
function renderSummary() {
    const balance = {};
    let totalSpent = 0;

    participants.forEach(p => balance[p] = 0); // 初始化淨餘額

    // Step 1: 計算每個人『支付』了多少 (正數)
    expenses.forEach(expense => {
        balance[expense.paidBy] += expense.amount;
        totalSpent += expense.amount;
    });

    // Step 2: 計算每個人『應付』了多少 (負數)
    expenses.forEach(expense => {
        expense.participants.forEach(pId => {
            // 如果某人不是付款人，則從他/她的淨餘額中減去應分攤的金額
            balance[pId] -= expense.sharePerPerson;
        });
    });
    
    // 渲染 UI
    const summaryContainer = document.getElementById('individual-balance');
    const conclusionElement = document.getElementById('summary-conclusion');
    const totalSpentElement = document.getElementById('total-spent');
    
    summaryContainer.innerHTML = '';
    totalSpentElement.textContent = `${totalSpent.toFixed(2)} THB`;

    let summaryText = '🎉 費用已結清！';
    
    participants.forEach(pId => {
        const net = balance[pId]; // 正數: 多付了(應收); 負數: 少付了(應付)
        const name = participantNames[pId];
        const item = document.createElement('div');
        item.classList.add('balance-item');
        
        let status = '';
        if (net > 0.01) {
            status = `<span style="color:green;">應收回 ${net.toFixed(2)} THB</span>`;
        } else if (net < -0.01) {
            status = `<span style="color:red;">應付 ${Math.abs(net).toFixed(2)} THB</span>`;
            summaryText = '⚠️ 需要結算！請參照下方列表。';
        } else {
            status = '已結清';
        }

        item.innerHTML = `<span>${name} 淨餘額：</span>${status}`;
        summaryContainer.appendChild(item);
    });

    conclusionElement.innerHTML = summaryText;
}


// 4. 輔助函數：儲存、渲染列表和刪除 (保持不變)
function saveExpenses() {
    localStorage.setItem('tripExpenses', JSON.stringify(expenses));
}

function renderExpenseList() {
    const container = document.getElementById('expense-list-container');
    container.innerHTML = '';

    expenses.forEach(expense => {
        const li = document.createElement('li');
        const participantsNames = expense.participants.map(id => participantNames[id]).join(', ');
        
        li.innerHTML = `
            <strong>${expense.description}</strong>: ${expense.amount.toFixed(2)} THB<br>
            <small>由 ${participantNames[expense.paidBy]} 支付，${participantsNames} 分攤 (${expense.sharePerPerson.toFixed(2)} THB/人)</small>
            <span style="float:right; color:red; cursor:pointer;" onclick="deleteExpense(${expense.id})">❌</span>
        `;
        container.appendChild(li);
    });
}

function deleteExpense(id) {
    expenses = expenses.filter(expense => expense.id !== id);
    saveExpenses();
    renderSummary();
    renderExpenseList();
}
