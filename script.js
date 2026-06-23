document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked button
            btn.classList.add('active');

            // Show corresponding content
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Form submission and calculation logic
    const form = document.getElementById('property-form');
    const propAmountInput = document.getElementById('prop-amount');
    const amountReceivedInput = document.getElementById('amount-received');
    const amountRemainingInput = document.getElementById('amount-remaining');

    function calculateRemaining() {
        if (!propAmountInput || !amountReceivedInput || !amountRemainingInput) return;
        const amount = Number(propAmountInput.value) || 0;
        const received = Number(amountReceivedInput.value) || 0;
        const remaining = amount - received;
        amountRemainingInput.value = remaining;
    }

    if (propAmountInput && amountReceivedInput) {
        propAmountInput.addEventListener('input', calculateRemaining);
        amountReceivedInput.addEventListener('input', calculateRemaining);
    }

    // Image Upload Logic
    const openUploadModalBtn = document.getElementById('open-upload-modal');
    const uploadModal = document.getElementById('upload-modal');
    const saveImagesBtn = document.getElementById('save-images-btn');
    const cancelImagesBtn = document.getElementById('cancel-images-btn');
    const imageInput = document.getElementById('image-input');
    const imagePreview = document.getElementById('image-preview');
    const imageCountSpan = document.getElementById('image-count');
    
    let uploadedImages = []; // Local temporary memory for images

    if (openUploadModalBtn && uploadModal) {
        openUploadModalBtn.addEventListener('click', () => {
            uploadModal.classList.add('active');
        });
        
        cancelImagesBtn.addEventListener('click', () => {
            uploadModal.classList.remove('active');
        });
        
        saveImagesBtn.addEventListener('click', () => {
            uploadModal.classList.remove('active');
            if (imageCountSpan) imageCountSpan.textContent = `(${uploadedImages.length})`;
            alert('تم إرفاق الصور بنجاح.');
        });
        
        imageInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                if (file.type.startsWith('image/')) {
                    const url = URL.createObjectURL(file);
                    uploadedImages.push(url);
                    
                    const img = document.createElement('img');
                    img.src = url;
                    imagePreview.appendChild(img);
                }
            });
            // Reset input so same files can be re-selected if needed
            imageInput.value = '';
        });
    }

    let transactionsData = [];
    let currentFilter = 'غير مكتملة';
    let editingId = null;

    const searchInput = document.getElementById('search-transactions');
    if (searchInput) {
        searchInput.addEventListener('input', renderTransactions);
    }
    
    const indexBtns = document.querySelectorAll('.index-btn');
    indexBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            indexBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderTransactions();
        });
    });

    function renderTransactions() {
        const allTransactionsList = document.getElementById('all-transactions-list');
        
        if (!allTransactionsList) return;

        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

        const filteredTransactions = transactionsData.filter(t => {
            const matchesSearch = t.sellerName.toLowerCase().includes(searchTerm) || 
                                  t.sellerPhone.includes(searchTerm);
            const matchesFilter = t.status === currentFilter;
            return matchesSearch && matchesFilter;
        });

        const createCardHTML = (t) => `
            <div class="transaction-card" data-id="${t.id}">
                <div class="transaction-card-info">
                    <h4>عقار رقم: ${t.propNumber}</h4>
                    <p><strong>البائع:</strong> ${t.sellerName}</p>
                </div>
                <div class="transaction-actions" style="display: flex; gap: 10px; margin-left: 15px; margin-right: 15px;">
                    <button type="button" class="action-btn edit-btn" data-id="${t.id}" title="تعديل">✏️</button>
                    <button type="button" class="action-btn delete-btn" data-id="${t.id}" title="حذف">🗑️</button>
                </div>
                <div class="transaction-card-arrow">&#10094;</div>
            </div>
        `;

        allTransactionsList.innerHTML = filteredTransactions.length > 0 
            ? filteredTransactions.map(createCardHTML).join('')
            : '<div class="empty-state">لا توجد معاملات من هذا النوع.</div>';
    }

    // Details Modal Logic
    const allTransactionsList = document.getElementById('all-transactions-list');
    const detailsModal = document.getElementById('details-modal');
    const detailsContent = document.getElementById('details-content');

    if (allTransactionsList && detailsModal) {
        allTransactionsList.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-btn');
            const editBtn = e.target.closest('.edit-btn');
            
            if (deleteBtn) {
                e.stopPropagation();
                const id = Number(deleteBtn.getAttribute('data-id'));
                if (confirm('هل أنت متأكد من حذف هذه المعاملة؟')) {
                    transactionsData = transactionsData.filter(t => t.id !== id);
                    renderTransactions();
                }
                return;
            }

            if (editBtn) {
                e.stopPropagation();
                const id = Number(editBtn.getAttribute('data-id'));
                const transaction = transactionsData.find(t => t.id === id);
                if (transaction) {
                    document.getElementById('prop-number').value = transaction.propNumber;
                    document.getElementById('prop-area').value = transaction.propArea || '';
                    document.getElementById('prop-date').value = transaction.propDate;
                    document.getElementById('seller-name').value = transaction.sellerName;
                    document.getElementById('seller-phone').value = transaction.sellerPhone;
                    document.getElementById('buyer-name').value = transaction.buyerName;
                    document.getElementById('buyer-phone').value = transaction.buyerPhone;
                    document.getElementById('prop-amount').value = transaction.propAmount;
                    document.getElementById('amount-received').value = transaction.amountReceived;
                    document.getElementById('amount-remaining').value = transaction.amountRemaining;
                    
                    uploadedImages = [...(transaction.images || [])];
                    if (imageCountSpan) imageCountSpan.textContent = `(${uploadedImages.length})`;
                    if (imagePreview) {
                        imagePreview.innerHTML = uploadedImages.map(imgSrc => `<img src="${imgSrc}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">`).join('');
                    }

                    editingId = id;
                    document.querySelector('.submit-btn').textContent = 'حفظ التعديلات';
                    
                    // Switch to add tab
                    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                    document.querySelector('[data-target="add-property"]').classList.add('active');
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    document.getElementById('add-property').classList.add('active');
                }
                return;
            }

            const card = e.target.closest('.transaction-card');
            if (card) {
                const id = Number(card.getAttribute('data-id'));
                const transaction = transactionsData.find(t => t.id === id);
                if (transaction) {
                    showDetailsModal(transaction);
                }
            }
        });
    }

    function showDetailsModal(t) {
        if (!detailsContent || !detailsModal) return;

        let imagesHTML = '';
        if (t.images && t.images.length > 0) {
            imagesHTML = `
                <p><strong>الصور:</strong></p>
                <div class="details-images">
                    ${t.images.map(imgSrc => `<img src="${imgSrc}" alt="صورة العقار">`).join('')}
                </div>
            `;
        }

        detailsContent.innerHTML = `
            <p><strong>حالة المعاملة:</strong> ${t.status}</p>
            <p><strong>رقم العقار:</strong> ${t.propNumber}</p>
            ${t.propArea ? `<p><strong>مساحة العقار:</strong> ${t.propArea}</p>` : ''}
            <p><strong>التاريخ:</strong> ${t.propDate}</p>
            <p><strong>البائع:</strong> ${t.sellerName} <span dir="ltr">(${t.sellerPhone || 'لا يوجد'})</span></p>
            <p><strong>المشتري:</strong> ${t.buyerName} <span dir="ltr">(${t.buyerPhone || 'لا يوجد'})</span></p>
            <p><strong>المبلغ الكلي:</strong> ${t.propAmount} دينار</p>
            <p><strong>الواصل:</strong> <span style="color:var(--secondary-color); font-weight:bold;">${t.amountReceived} دينار</span></p>
            <p><strong>الباقي:</strong> <span style="color:var(--danger-color); font-weight:bold;">${t.amountRemaining} دينار</span></p>
            ${imagesHTML}
        `;
        
        const actionsContainer = document.querySelector('#details-modal .modal-actions');
        actionsContainer.innerHTML = `<button type="button" id="close-details-btn" class="btn-3d btn-red">إغلاق</button>`;
        
        if (t.status === 'غير مكتملة') {
            const btn = document.createElement('button');
            btn.className = 'btn-3d btn-green';
            btn.textContent = 'نقل إلى المعاملات الجارية';
            btn.onclick = () => {
                t.status = 'جارية';
                detailsModal.classList.remove('active');
                renderTransactions();
            };
            actionsContainer.prepend(btn);
        } else if (t.status === 'جارية') {
            const btn = document.createElement('button');
            btn.className = 'btn-3d btn-green';
            btn.textContent = 'نقل إلى المعاملات المكتملة';
            btn.onclick = () => {
                t.status = 'مكتملة';
                detailsModal.classList.remove('active');
                renderTransactions();
            };
            actionsContainer.prepend(btn);
        }

        document.getElementById('close-details-btn').addEventListener('click', () => {
            detailsModal.classList.remove('active');
        });

        detailsModal.classList.add('active');
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const propNumber = document.getElementById('prop-number')?.value || '';
            const propArea = document.getElementById('prop-area')?.value || '';
            const propDate = document.getElementById('prop-date')?.value || '';
            const sellerName = document.getElementById('seller-name')?.value || '';
            const sellerPhone = document.getElementById('seller-phone')?.value || '';
            const buyerName = document.getElementById('buyer-name')?.value || '';
            const buyerPhone = document.getElementById('buyer-phone')?.value || '';
            const propAmount = document.getElementById('prop-amount')?.value || '0';
            const amountReceived = document.getElementById('amount-received')?.value || '0';
            const amountRemaining = document.getElementById('amount-remaining')?.value || '0';

            if (editingId) {
                const index = transactionsData.findIndex(t => t.id === editingId);
                if (index !== -1) {
                    transactionsData[index] = {
                        ...transactionsData[index],
                        propNumber, propArea, propDate, sellerName, sellerPhone,
                        buyerName, buyerPhone, propAmount, amountReceived, amountRemaining,
                        images: uploadedImages.length > 0 ? [...uploadedImages] : transactionsData[index].images
                    };
                }
                editingId = null;
                alert('تم تعديل العقار بنجاح!');
                document.querySelector('.submit-btn').textContent = 'حفظ العقار';
            } else {
                const transaction = {
                    id: Date.now(),
                    status: 'غير مكتملة',
                    propNumber, propArea, propDate, sellerName, sellerPhone,
                    buyerName, buyerPhone, propAmount, amountReceived, amountRemaining,
                    images: [...uploadedImages]
                };
                transactionsData.push(transaction);
                alert('تم حفظ العقار بنجاح!');
            }

            renderTransactions();

            form.reset();
            if (amountRemainingInput) amountRemainingInput.value = '0';
            
            // Clear temporary images
            uploadedImages = [];
            if (imagePreview) imagePreview.innerHTML = '';
            if (imageCountSpan) imageCountSpan.textContent = '(0)';
        });
    }

    // Treasury Logic
    let treasuryBalance = 0;
    let treasuryHistory = [];
    
    const btnDeposit = document.getElementById('btn-deposit');
    const btnWithdraw = document.getElementById('btn-withdraw');
    const treasuryModal = document.getElementById('treasury-modal');
    const treasuryModalTitle = document.getElementById('treasury-modal-title');
    const treasuryForm = document.getElementById('treasury-form');
    const treasuryTypeInput = document.getElementById('treasury-type');
    const treasuryAmountInput = document.getElementById('treasury-amount');
    const treasuryDateInput = document.getElementById('treasury-date');
    const treasuryReasonInput = document.getElementById('treasury-reason');
    const cancelTreasuryBtn = document.getElementById('cancel-treasury-btn');
    const totalBalanceDisplay = document.getElementById('total-balance');
    const treasuryHistoryList = document.getElementById('treasury-history-list');

    function updateTreasuryUI() {
        // Calculate balance
        let total = 0;
        treasuryHistory.forEach(t => {
            if (t.type === 'deposit') {
                total += Number(t.amount);
            } else if (t.type === 'withdraw') {
                total -= Number(t.amount);
            }
        });
        treasuryBalance = total;
        
        // Formatter for numbers
        const formatter = new Intl.NumberFormat('en-US');
        if (totalBalanceDisplay) {
            totalBalanceDisplay.textContent = `${formatter.format(treasuryBalance)} دينار`;
        }

        // Render History
        if (treasuryHistoryList) {
            if (treasuryHistory.length === 0) {
                treasuryHistoryList.innerHTML = '<div class="empty-state">لا توجد حركات في المحفظة حتى الآن.</div>';
            } else {
                treasuryHistoryList.innerHTML = treasuryHistory.map(t => {
                    const isDeposit = t.type === 'deposit';
                    const typeLabel = isDeposit ? 'إيداع' : 'سحب';
                    const typeColor = isDeposit ? 'var(--secondary-color)' : 'var(--danger-color)';
                    return `
                        <div class="transaction-card" style="border-right: 4px solid ${typeColor}; padding-right: 15px;">
                            <div class="transaction-card-info">
                                <h4 style="color: ${typeColor}; margin-bottom: 0.5rem;">${typeLabel}</h4>
                                <p><strong>المبلغ:</strong> <span dir="ltr">${formatter.format(t.amount)}</span> دينار</p>
                                <p><strong>التاريخ:</strong> ${t.date}</p>
                                <p><strong>السبب:</strong> ${t.reason}</p>
                            </div>
                        </div>
                    `;
                }).reverse().join(''); // Reverse to show latest first
            }
        }
    }

    if (btnDeposit && btnWithdraw && treasuryModal && cancelTreasuryBtn) {
        btnDeposit.addEventListener('click', () => {
            treasuryTypeInput.value = 'deposit';
            treasuryModalTitle.textContent = 'إضافة مبلغ';
            treasuryForm.reset();
            treasuryDateInput.valueAsDate = new Date();
            treasuryModal.classList.add('active');
        });

        btnWithdraw.addEventListener('click', () => {
            treasuryTypeInput.value = 'withdraw';
            treasuryModalTitle.textContent = 'سحب مبلغ';
            treasuryForm.reset();
            treasuryDateInput.valueAsDate = new Date();
            treasuryModal.classList.add('active');
        });

        cancelTreasuryBtn.addEventListener('click', () => {
            treasuryModal.classList.remove('active');
        });

        treasuryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const type = treasuryTypeInput.value;
            const amount = Number(treasuryAmountInput.value);
            const date = treasuryDateInput.value;
            const reason = treasuryReasonInput.value;

            if (type === 'withdraw' && amount > treasuryBalance) {
                alert('عذراً، الرصيد الحالي لا يكفي لإتمام عملية السحب.');
                return;
            }

            treasuryHistory.push({
                id: Date.now(),
                type,
                amount,
                date,
                reason
            });

            updateTreasuryUI();
            treasuryModal.classList.remove('active');
            
            if (type === 'deposit') {
                alert('تم الإيداع بنجاح');
            } else {
                alert('تم السحب بنجاح');
            }
        });
        
        // Initial render
        updateTreasuryUI();
    }
});
