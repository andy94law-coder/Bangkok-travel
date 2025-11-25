// 初始設定
let expenses = JSON.parse(localStorage.getItem('tripExpenses')) || [];
const participants = ['A', 'B']; // 參與者名單，請手動修改為實際人名

// 儲存開銷
function saveExpenses() {
    localStorage.setItem('tripExpenses', JSON.stringify(expenses));
}

// 新增開銷
function addExpense() {
    const description = document.getElementById('expense-description').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const paidBy = document.getElementById('expense-paid-by').value;

    if (!description || isNaN(amount) || amount <= 0) {
        alert('請輸入有效的項目說明和金額！');
        return;
    }

    const newExpense = {
        id: Date.now(),
        description: description,
        amount: amount,
        paidBy: paidBy,
        share: amount / participants.length // 平均分攤
    };

    expenses.push(newExpense);
    saveExpenses();
    renderSummary();
    renderExpenseList();

    // 清空輸入框
    document.getElementById('expense-description').value = '';
    document.getElementById('expense-amount').value = '';
}

// 渲染開銷列表
function renderExpenseList() {
    const container = document.getElementById('expense-list-container');
    container.innerHTML = ''; // 清空現有列表

    expenses.forEach(expense => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${expense.description}</strong>: ${expense.amount.toFixed(2)} THB (由 ${expense.paidBy} 支付)
            <span style="float:right; color:red; cursor:pointer;" onclick="deleteExpense(${expense.id})">❌</span>
        `;
        container.appendChild(li);
    });
}

// 刪除開銷
function deleteExpense(id) {
    expenses = expenses.filter(expense => expense.id !== id);
    saveExpenses();
    renderSummary();
    renderExpenseList();
}


// 計算並渲染總結
function renderSummary() {
    const balance = {};
    let totalSpent = 0;

    participants.forEach(p => balance[p] = 0);

    // 1. 計算每個人支付了多少
    expenses.forEach(expense => {
        balance[expense.paidBy] += expense.amount;
        totalSpent += expense.amount;
    });

    // 2. 計算每個人應該分攤多少
    const totalShare = totalSpent / participants.length;
    
    // 3. 計算淨餘額 (支付 - 應分攤)
    const summaryContainer = document.getElementById('individual-balance');
    const conclusionElement = document.getElementById('summary-conclusion');
    const totalSpentElement = document.getElementById('total-spent');
    
    summaryContainer.innerHTML = '';
    totalSpentElement.textContent = `${totalSpent.toFixed(2)} THB`;

    let summaryText = '🎉 費用已結清！';
    let minBalance = 0; // 找需要支付錢的人

    participants.forEach(p => {
        const net = balance[p] - totalShare; // 正數: 多付了; 負數: 少付了
        const item = document.createElement('div');
        item.classList.add('balance-item');
        
        let status = '';
        if (net > 0.01) {
            status = `<span style="color:green;">應收回 ${net.toFixed(2)} THB</span>`;
        } else if (net < -0.01) {
            status = `<span style="color:red;">應付 ${Math.abs(net).toFixed(2)} THB</span>`;
            if (net < minBalance) minBalance = net; // 找到欠錢最多的
        } else {
            status = '已結清';
        }

        item.innerHTML = `<span>${p} 淨餘額：</span>${status}`;
        summaryContainer.appendChild(item);
    });

    // 最終結論
    if (minBalance < -0.01) {
        // 簡單結算邏輯：欠錢最多的付給多付錢的人
        const owingPerson = participants.find(p => (balance[p] - totalShare) === minBalance);
        const owedPerson = participants.find(p => (balance[p] - totalShare) === Math.abs(minBalance));
        
        if (owingPerson && owedPerson) {
             summaryText = `**${owingPerson}** 應支付 **${owedPerson}** ${Math.abs(minBalance).toFixed(2)} THB。`;
        } else {
             // 如果參與者超過兩人，結算需要更複雜的算法，這裡只顯示總結
             summaryText = `請檢查上方餘額，確保結清！`;
        }
    }
    conclusionElement.innerHTML = summaryText;
}


// 頁面載入時執行
document.addEventListener('DOMContentLoaded', () => {
    // ⚠️ 記得修改 participants 的人名，並在這裡重新運行一次
    // participants = ['您的名字', '旅伴名字']; 
    
    renderSummary();
    renderExpenseList();
});
