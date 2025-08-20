        let transactions = [];
        let nextTransactionId = 1;
        let displayedTransactions = [];
        let currentPage = 1;
        const rowsPerPage = 15;
        const addTransactionBtn = document.getElementById('add-transaction-btn');
        const transactionsListBody = document.getElementById('transactions-list');
        const totalExpensesDisplay = document.getElementById('total-expenses');
        const totalGainsDisplay = document.getElementById('total-gains');
        const finalBalanceDisplay = document.getElementById('final-balance');
        const monthlyReportsContainer = document.getElementById('monthly-reports-container');
        const applyFiltersBtn = document.getElementById('apply-filters-btn');
        const exportCsvBtn = document.getElementById('export-csv-btn');
        const importCsvBtn = document.getElementById('import-csv-btn');
        const importCsvInput = document.getElementById('import-csv-input');
        const categorySpendingList = document.getElementById('category-spending-list');
        const paginationControls = document.getElementById('pagination-controls');
        const deleteAllDataBtn = document.getElementById('delete-all-data-btn');

        function formatCurrency(value) { return `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`; }
        
        function updateGlobalTotals() { const totalExpenses = transactions.reduce((acc, t) => t.type === 'expense' ? acc + t.value : acc, 0); const totalGains = transactions.reduce((acc, t) => t.type === 'gain' ? acc + t.value : acc, 0); const finalBalance = totalGains - totalExpenses; totalExpensesDisplay.textContent = formatCurrency(totalExpenses); totalGainsDisplay.textContent = formatCurrency(totalGains); finalBalanceDisplay.textContent = formatCurrency(finalBalance); finalBalanceDisplay.style.color = finalBalance < 0 ? '#e74c3c' : (finalBalance > 0 ? '#27ae60' : '#3498db'); }

        function renderAllTransactions(transactionsToRender) {
            transactionsListBody.innerHTML = '';
            const startIndex = (currentPage - 1) * rowsPerPage;
            const endIndex = startIndex + rowsPerPage;
            const paginatedItems = transactionsToRender.slice(startIndex, endIndex);
            paginatedItems.forEach(transaction => {
                const newRow = document.createElement('tr');
                newRow.setAttribute('data-transaction-id', transaction.id);
                newRow.classList.toggle('editing-row', transaction.isEditing || false);
                if (transaction.isEditing) {
                    newRow.innerHTML = `<td><select class="edit-type"><option value="expense" ${transaction.type === 'expense' ? 'selected' : ''}>Gasto</option><option value="gain" ${transaction.type === 'gain' ? 'selected' : ''}>Ganho</option></select></td><td><input type="date" class="edit-date" value="${transaction.date}"></td><td><input type="number" step="0.01" class="edit-value" value="${transaction.value}"></td><td><input type="text" class="edit-category" value="${transaction.category}"></td><td><input type="text" class="edit-location" value="${transaction.location}"></td><td><button class="action-btn save-btn" onclick="saveEditedTransaction(${transaction.id})">Salvar</button></td>`;
                } else {
                    const typeText = transaction.type === 'expense' ? 'Gasto' : 'Ganho';
                    const valueFormatted = (transaction.type === 'expense' ? '- ' : '+ ') + formatCurrency(transaction.value);
                    newRow.innerHTML = `<td>${typeText}</td><td>${new Date(transaction.date + 'T12:00:00').toLocaleDateString('pt-BR')}</td><td style="color: ${transaction.type === 'expense' ? '#e74c3c' : '#27ae60'}">${valueFormatted}</td><td>${transaction.category}</td><td>${transaction.location}</td><td><button class="action-btn edit-btn" onclick="toggleEditTransaction(${transaction.id})">Editar</button><button class="action-btn delete-btn" onclick="deleteTransaction(${transaction.id})">Excluir</button></td>`;
                }
                transactionsListBody.appendChild(newRow);
            });
        }

        function setupPagination(items, wrapper) {
            wrapper.innerHTML = "";
            const pageCount = Math.ceil(items.length / rowsPerPage);
            if (pageCount <= 1) return;
            const prevButton = document.createElement('button');
            prevButton.classList.add('page-btn');
            prevButton.innerText = 'Anterior';
            prevButton.disabled = currentPage === 1;
            prevButton.addEventListener('click', () => { currentPage--; renderAllTransactions(displayedTransactions); setupPagination(displayedTransactions, wrapper); });
            wrapper.appendChild(prevButton);
            for (let i = 1; i <= pageCount; i++) {
                const btn = document.createElement('button');
                btn.classList.add('page-btn');
                if (i === currentPage) { btn.classList.add('active'); }
                btn.innerText = i;
                btn.addEventListener('click', () => { currentPage = i; renderAllTransactions(displayedTransactions); setupPagination(displayedTransactions, wrapper); });
                wrapper.appendChild(btn);
            }
            const nextButton = document.createElement('button');
            nextButton.classList.add('page-btn');
            nextButton.innerText = 'Próximo';
            nextButton.disabled = currentPage === pageCount;
            nextButton.addEventListener('click', () => { currentPage++; renderAllTransactions(displayedTransactions); setupPagination(displayedTransactions, wrapper); });
            wrapper.appendChild(nextButton);
        }

        function renderMonthlyReports() {
            monthlyReportsContainer.innerHTML = '';
            if (transactions.length === 0) { monthlyReportsContainer.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Nenhum relatório mensal gerado ainda.</p>'; return; }
            const transactionsByMonth = transactions.reduce((acc, transaction) => { const date = new Date(transaction.date + 'T12:00:00'); const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`; if (!acc[yearMonth]) { acc[yearMonth] = []; } acc[yearMonth].push(transaction); return acc; }, {});
            const sortedMonths = Object.keys(transactionsByMonth).sort().reverse();
            sortedMonths.forEach(yearMonth => {
                const monthTransactions = transactionsByMonth[yearMonth];
                let monthlyExpenses = 0; let monthlyGains = 0;
                monthTransactions.forEach(transaction => { if (transaction.type === 'expense') { monthlyExpenses += transaction.value; } else { monthlyGains += transaction.value; } });
                const monthlyBalance = monthlyGains - monthlyExpenses;
                const [year, monthNum] = yearMonth.split('-');
                const monthName = new Date(year, parseInt(monthNum) - 1, 1).toLocaleString('pt-br', { month: 'long', year: 'numeric' });
                const monthReportCard = document.createElement('div');
                monthReportCard.classList.add('month-report-card');
                monthReportCard.innerHTML = `<h3>${monthName.charAt(0).toUpperCase() + monthName.slice(1)}</h3><div class="month-summary"><div><p>Gastos do Mês:</p><p class="expenses-sum">${formatCurrency(monthlyExpenses)}</p></div><div><p>Ganhos do Mês:</p><p class="gains-sum">${formatCurrency(monthlyGains)}</p></div><div><p>Saldo do Mês:</p><p class="balance-sum">${formatCurrency(monthlyBalance)}</p></div></div>`;
                monthlyReportsContainer.appendChild(monthReportCard);
            });
        }

        function renderSpendingAnalysis() { const expenses = transactions.filter(t => t.type === 'expense'); categorySpendingList.innerHTML = ''; if (expenses.length === 0) { categorySpendingList.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Adicione gastos para ver a análise.</p>'; return; } const spendingByCategory = expenses.reduce((acc, expense) => { const category = expense.category || 'Outros'; if (!acc[category]) { acc[category] = 0; } acc[category] += expense.value; return acc; }, {}); const sortedCategories = Object.entries(spendingByCategory).sort(([, a], [, b]) => b - a); const maxSpending = sortedCategories[0][1]; sortedCategories.forEach(([category, total]) => { const barPercentage = (total / maxSpending) * 100; const listItem = document.createElement('li'); listItem.classList.add('category-item'); listItem.innerHTML = `<div class="category-info">${category}</div><div class="bar-container"><div class="bar-fill" style="width: ${barPercentage}%;"></div></div><div class="category-amount">${formatCurrency(total)}</div>`; categorySpendingList.appendChild(listItem); }); }
        
        function saveTransactions() { localStorage.setItem('financialTransactions', JSON.stringify(transactions)); localStorage.setItem('nextTransactionId', nextTransactionId.toString()); }
        
        async function loadTransactions() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/transacoes');
        if (!response.ok) {
            throw new Error('Falha ao buscar transações do servidor.');
        }
        const serverTransactions = await response.json();
        transactions = serverTransactions; // Atualiza nosso array principal
        displayedTransactions = [...transactions];
        console.log('Transações carregadas do servidor:', transactions);
    } catch (error) {
        console.error(error);
        alert('Não foi possível carregar os dados. O backend está rodando?');
    }
}
        
        async function addTransaction() {
            const type = document.getElementById('transaction-type').value;
            const value = parseFloat(document.getElementById('transaction-value').value);
            const date = document.getElementById('transaction-date').value;
            const category = document.getElementById('transaction-category').value;
            const location = document.getElementById('transaction-location').value;

            if (isNaN(value) || value <= 0 || !date) {
                alert('Por favor, insira um valor e uma data válidos.');
                return;
            }

            // Prepara os dados para enviar, usando os nomes em inglês que o backend espera
            const newTransactionData = {
                tipo: type,
                valor: value,
                data: date,
                categoria: category || 'Outros',
                local_origem: location || 'Não Informado'
            };

            try {
                const response = await fetch('http://127.0.0.1:5000/api/transacoes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newTransactionData)
                });

                if (!response.ok) {
                    throw new Error('Falha ao adicionar transação.');
                }

                // Limpa o formulário e recarrega os dados do servidor
                document.getElementById('transaction-value').value = '';
                document.getElementById('transaction-date').value = '';
                document.getElementById('transaction-category').value = '';
                document.getElementById('transaction-location').value = '';

                await loadTransactions();
                saveAndRerender();

            } catch (error) {
                console.error(error);
                alert('Não foi possível salvar a transação. O backend está rodando?');
            }
}
        
        function deleteTransaction(idToDelete) { if (confirm('Tem certeza que deseja excluir esta transação?')) { transactions = transactions.filter(t => t.id !== idToDelete); saveAndRerender(); } }

        function deleteAllData() { const isConfirmed = confirm('TEM CERTEZA QUE DESEJA EXCLUIR TODOS OS DADOS?\n\nEsta ação não pode ser desfeita e apagará permanentemente todas as suas transações.'); if (isConfirmed) { transactions = []; nextTransactionId = 1; currentPage = 1; saveAndRerender(); alert('Todos os dados foram excluídos.'); } }
        
        function toggleEditTransaction(idToEdit) { const transaction = transactions.find(t => t.id === idToEdit); if (transaction) { transaction.isEditing = !transaction.isEditing; } renderAllTransactions(displayedTransactions); }
        
        function saveEditedTransaction(idToSave) { const row = document.querySelector(`tr[data-transaction-id='${idToSave}']`); const transaction = transactions.find(t => t.id === idToSave); if (row && transaction) { const newType = row.querySelector('.edit-type').value; const newDate = row.querySelector('.edit-date').value; const newValue = parseFloat(row.querySelector('.edit-value').value); const newCategory = row.querySelector('.edit-category').value; const newLocation = row.querySelector('.edit-location').value; if (isNaN(newValue) || newValue <= 0 || !newDate) { alert('Os valores para data e valor não podem estar vazios.'); return; } transaction.type = newType; transaction.date = newDate; transaction.value = newValue; transaction.category = newCategory; transaction.location = newLocation; transaction.isEditing = false; saveAndRerender(); } }
        
        function applyFilters() { const filterType = document.getElementById('filter-type').value; const filterStartDate = document.getElementById('filter-start-date').value; const filterEndDate = document.getElementById('filter-end-date').value; displayedTransactions = transactions.filter(t => { let matchesType = (filterType === 'all') || (t.type === filterType); let matchesStartDate = (!filterStartDate) || (t.date >= filterStartDate); let matchesEndDate = (!filterEndDate) || (t.date <= filterEndDate); return matchesType && matchesStartDate && matchesEndDate; }); currentPage = 1; renderAllTransactions(displayedTransactions); setupPagination(displayedTransactions, paginationControls); }
        
        function exportToCSV() { const transactionsToExport = displayedTransactions; if (transactionsToExport.length === 0) { alert("Não há transações para exportar."); return; } const csvHeader = "ID,Tipo,Data,Valor,Categoria,Local/Origem\n"; const csvRows = transactionsToExport.map(t => `${t.id},${t.type},${t.date},${t.value.toFixed(2)},"${t.category}","${t.location}"`).join("\n"); const csvContent = csvHeader + csvRows; const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.setAttribute("href", url); link.setAttribute("download", "transacoes_financeiras.csv"); document.body.appendChild(link); link.click(); document.body.removeChild(link); }
        
        function importFromCSV(event) { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = function (e) { const text = e.target.result; const rows = text.split('\n').slice(1); let importedCount = 0; rows.forEach(row => { if (row.trim() === '') return; const columns = row.split(','); if (columns.length >= 5) { const newTransaction = { id: nextTransactionId++, type: columns[1].trim(), date: columns[2].trim(), value: parseFloat(columns[3]), category: columns[4].trim().replace(/"/g, ''), location: columns[5] ? columns[5].trim().replace(/"/g, '') : 'Não Informado' }; if ((newTransaction.type === 'gain' || newTransaction.type === 'expense') && !isNaN(newTransaction.value) && newTransaction.date) { transactions.unshift(newTransaction); importedCount++; } } }); if (importedCount > 0) { alert(`${importedCount} transações importadas com sucesso!`); saveAndRerender(); } else { alert("Nenhuma transação válida encontrada no arquivo ou o formato está incorreto."); } importCsvInput.value = ''; }; reader.readAsText(file); }
        
        function saveAndRerender() { transactions.sort((a, b) => new Date(b.date) - new Date(a.date)); saveTransactions(); applyFilters(); updateGlobalTotals(); renderMonthlyReports(); renderSpendingAnalysis(); }
        
        addTransactionBtn.addEventListener('click', addTransaction);
        applyFiltersBtn.addEventListener('click', applyFilters);
        exportCsvBtn.addEventListener('click', exportToCSV);
        importCsvBtn.addEventListener('click', () => importCsvInput.click());
        importCsvInput.addEventListener('change', importFromCSV);
        deleteAllDataBtn.addEventListener('click', deleteAllData);
        
        document.addEventListener('DOMContentLoaded',async () => {
            await loadTransactions();
            saveAndRerender();
        });