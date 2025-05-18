const path = 'http://localhost:3000';

let selectedProduct = null;
let selectedProductIndex = -1;
let activeCategory = null;

const categoryNames = {
  'food-bread': 'Хлеб и выпечка',
  'food-fruits': 'Фрукты и овощи',
  'food-meat': 'Мясо и молочные продукты',
  'clothing-coats': 'Куртки и пальто',
  'clothing-national': 'Национальная одежда',
  'clothing-kids-shoes': 'Обувь для детей',
  'household-cleaning': 'Средства для уборки',
  'household-dishes': 'Посуда и кухонные принадлежности',
  'household-textile': 'Текстиль',
  'electronics-phones': 'Мобильные телефоны и зарядные устройства',
  'electronics-lights': 'Лампы и светильники',
  'electronics-small': 'Мелкая бытовая техника'
};

// ==================== API ФУНКЦИИ ====================

async function fetchProducts(category) {
  try {
    const response = await fetch(`${path}/${category}`);
    if (!response.ok) throw new Error('Ошибка при загрузке товаров');
    return await response.json();
  } catch (error) {
    showSnackbar('Ошибка: ' + error.message, 'error');
    return [];
  }
}

async function addProduct(product, category) {
  try {
    const response = await fetch(`${path}/${category}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка при добавлении товара');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

async function updateProduct(product, category, id) {
  try {
    const response = await fetch(`${path}/${category}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка при обновлении товара');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

async function deleteProduct(category, id) {
  try {
    const response = await fetch(`${path}/${category}/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка при удалении товара');
    }
    return true;
  } catch (error) {
    throw error;
  }
}

// ==================== ОСНОВНЫЕ ФУНКЦИИ ====================

async function showProducts(category) {
  activeCategory = category;
  const welcomeMessage = document.getElementById('welcome-message');
  const productsContainer = document.getElementById('products-container');
  const tbody = document.getElementById('products-body');

  welcomeMessage.style.display = 'none';
  productsContainer.style.display = 'block';

  tbody.innerHTML = '<tr><td colspan="4">Загрузка...</td></tr>';
  
  try {
    const products = await fetchProducts(category);
    
    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">Товары не найдены</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    products.forEach((product, index) => {
      const row = document.createElement('tr');
      row.onclick = () => openSidebar('view', product, index);
      row.innerHTML = `
        <td>${product.name}</td>
        <td>${product.sku}</td>
        <td>${product.price}</td>
        <td><span class="${product.status === 'Активный' ? 'status-active' : 'status-inactive'}">${product.status}</span></td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="4">Ошибка загрузки</td></tr>';
    showSnackbar('Ошибка загрузки товаров: ' + error.message, 'error');
  }
}

function openSidebar(mode, product = null, index = -1) {
  if (mode !== 'delete') {
    selectedProduct = product;
    selectedProductIndex = index;
  }

  const panel = document.getElementById('sidebar-panel');
  const panelBody = document.getElementById('panel-body');
  const panelTitle = document.getElementById('panel-title');
  const actions = document.querySelector('.sidebar-actions');

  panelBody.innerHTML = '';
  panel.classList.add('active');

  switch (mode) {
    case 'view':
      panelTitle.textContent = 'Просмотр товара';
      actions.style.display = 'flex';
      panelBody.innerHTML = `
        <div class="form-card">
          <div class="form-group">
            <label>Изображение</label>
            ${product.image ? `<img src="${product.image}" alt="${product.name}" class="preview-image">` : '<p>Изображение не загружено</p>'}
          </div>
          <div class="form-group">
            <label>Название товара</label>
            <p>${product.name}</p>
          </div>
          <div class="form-group">
            <label>Код товара</label>
            <p>${product.sku}</p>
          </div>
          <div class="form-group">
            <label>Цена</label>
            <p>${product.price}</p>
          </div>
          <div class="form-group">
            <label>Количество</label>
            <p>${product.quantity}</p>
          </div>
          <div class="form-group">
            <label>Категория</label>
            <p>${activeCategory ? categoryNames[activeCategory] : 'Не выбрано'}</p>
          </div>
          <div class="form-group">
            <label>Статус</label>
            <p>${product.status}</p>
          </div>
          <div class="form-group">
            <label>Описание</label>
            <p>${product.description || 'Нет описания'}</p>
          </div>
        </div>
      `;
      break;

    case 'add':
      panelTitle.textContent = 'Новый товар';
      actions.style.display = 'none';
      panelBody.innerHTML = `
        <form id="add-product-form" class="add-form">
          <div class="form-card">
            <div class="form-group">
              <label>Название</label>
              <input type="text" name="name" placeholder="Введите название" required>
            </div>
            <div class="form-group">
              <label>Код товара (SKU)</label>
              <input type="text" name="sku" placeholder="Введите код товара" required>
            </div>
            <div class="form-group">
              <label>Активность товара</label>
              <label class="switch">
                <input type="checkbox" name="status" checked>
                <span class="slider"></span>
              </label>
            </div>
            <div class="form-group">
              <label>Описание</label>
              <textarea name="description" placeholder="Введите описание" required></textarea>
            </div>
            <div class="form-group">
              <label>Цена</label>
              <input type="number" step="0.01" name="price" placeholder="Введите цену" required>
            </div>
            <div class="form-group">
              <label>Количество</label>
              <input type="number" name="quantity" placeholder="Введите количество" required>
            </div>
            <div class="form-group">
              <label>Изображение</label>
              <div class="file-upload">
                <input type="file" name="image" accept="image/*" id="image-upload">
                <label for="image-upload" class="file-label"><i class="fas fa-upload"></i> Выберите файл</label>
                <div class="image-preview" id="image-preview"></div>
              </div>
            </div>
          </div>
          <div class="button-group">
            <button type="submit" class="add-button"><i class="fas fa-plus"></i> Добавить</button>
            <button type="button" class="cancel-button" onclick="closeSidebar()"><i class="fas fa-times"></i> Отмена</button>
          </div>
        </form>
      `;

      setupAddForm();
      break;

    case 'edit':
      panelTitle.textContent = 'Редактировать товар';
      actions.style.display = 'none';
      panelBody.innerHTML = `
        <form id="edit-product-form" class="add-form">
          <div class="form-card">
            <div class="form-group">
              <label>Название</label>
              <input type="text" name="name" value="${product.name}" required>
            </div>
            <div class="form-group">
              <label>Код товара (SKU)</label>
              <input type="text" name="sku" value="${product.sku}" required readonly>
            </div>
            <div class="form-group">
              <label>Активность товара</label>
              <label class="switch">
                <input type="checkbox" name="status" ${product.status === 'Активный' ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
            <div class="form-group">
              <label>Описание</label>
              <textarea name="description" required>${product.description || ''}</textarea>
            </div>
            <div class="form-group">
              <label>Цена</label>
              <input type="number" step="0.01" name="price" value="${product.price}" required>
            </div>
            <div class="form-group">
              <label>Количество</label>
              <input type="number" name="quantity" value="${product.quantity}" required>
            </div>
            <div class="form-group">
              <label>Изображение</label>
              <div class="file-upload">
                <input type="file" name="image" accept="image/*" id="image-upload">
                <label for="image-upload" class="file-label"><i class="fas fa-upload"></i> Выберите файл</label>
                <div class="image-preview" id="image-preview">
                  ${product.image ? `<img src="${product.image}" alt="${product.name}" class="preview-image"><i class="fas fa-times remove-image" onclick="removeImage(this)"></i>` : ''}
                </div>
              </div>
            </div>
          </div>
          <div class="button-group">
            <button type="submit" class="add-button"><i class="fas fa-save"></i> Сохранить</button>
            <button type="button" class="cancel-button" onclick="closeSidebar()"><i class="fas fa-times"></i> Отмена</button>
          </div>
        </form>
      `;

      setupEditForm();
      break;

    case 'delete':
      if (!selectedProduct || !selectedProduct.id || !activeCategory) {
        showSnackbar('Ошибка: товар или категория не выбраны', 'error');
        return;
      }
      const modal = document.getElementById('delete-modal');
      const productName = document.getElementById('product-name');
      productName.textContent = selectedProduct.name;
      modal.classList.add('active');
      break;
  }
}

// ==================== ФОРМЫ ====================

function setupAddForm() {
  document.getElementById('add-product-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    e.stopPropagation();
    const form = this;
    
    const product = {
      name: form.querySelector('[name="name"]').value.trim(),
      sku: form.querySelector('[name="sku"]').value.trim(),
      price: form.querySelector('[name="price"]').value.trim(),
      status: form.querySelector('[name="status"]').checked ? 'Активный' : 'Неактивный',
      description: form.querySelector('[name="description"]').value.trim(),
      quantity: parseInt(form.querySelector('[name="quantity"]').value),
      image: ''
    };

    try {
      await addProduct(product, activeCategory);
      await showProducts(activeCategory);
      showSnackbar('Товар успешно добавлен', 'success');
      closeSidebar();
    } catch (error) {
      showSnackbar('Ошибка: ' + error.message, 'error');
    }
  });

  setupImageUpload('add-product-form');
}

function setupEditForm() {
  document.getElementById('edit-product-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const form = this;
    
    const updatedProduct = {
      name: form.querySelector('[name="name"]').value.trim(),
      sku: form.querySelector('[name="sku"]').value.trim(),
      price: form.querySelector('[name="price"]').value.trim(),
      status: form.querySelector('[name="status"]').checked ? 'Активный' : 'Неактивный',
      description: form.querySelector('[name="description"]').value.trim(),
      quantity: parseInt(form.querySelector('[name="quantity"]').value),
      image: selectedProduct.image
    };

    try {
      await updateProduct(updatedProduct, activeCategory, selectedProduct.id);
      await showProducts(activeCategory);
      showSnackbar('Товар успешно обновлён', 'success');
      closeSidebar();
    } catch (error) {
      showSnackbar('Ошибка: ' + error.message, 'error');
    }
  });

  setupImageUpload('edit-product-form');
}

function setupImageUpload(formId) {
  const form = document.getElementById(formId);
  const imageInput = form.querySelector('#image-upload');
  const preview = form.querySelector('#image-preview');

  imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    preview.innerHTML = '';
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function(e) {
        preview.innerHTML = `
          <img src="${e.target.result}" alt="Preview" class="preview-image">
          <i class="fas fa-times remove-image" onclick="removeImage(this)"></i>
        `;
      };
      reader.readAsDataURL(file);
    }
  });
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

async function confirmDelete() {
  if (!selectedProduct || !selectedProduct.id || !activeCategory) {
    showSnackbar('Ошибка: товар не выбран', 'error');
    return;
  }

  try {
    await deleteProduct(activeCategory, selectedProduct.id);
    await showProducts(activeCategory);
    showSnackbar('Товар успешно удалён', 'success');
    closeModal();
    closeSidebar();
  } catch (error) {
    showSnackbar('Ошибка: ' + error.message, 'error');
  }
}

function closeSidebar() {
  const panel = document.getElementById('sidebar-panel');
  panel.classList.remove('active');
  selectedProduct = null;
  selectedProductIndex = -1;
}

function closeModal() {
  const modal = document.getElementById('delete-modal');
  modal.classList.remove('active');
}

function removeImage(element) {
  const preview = element.parentElement;
  preview.innerHTML = '';
  const form = element.closest('form');
  if (form) {
    form.querySelector('#image-upload').value = '';
  }
}

function showSnackbar(message, type) {
  const snackbar = document.getElementById('snackbar');
  snackbar.textContent = message;
  snackbar.className = 'show ' + type;
  setTimeout(() => { 
    snackbar.className = snackbar.className.replace('show', ''); 
  }, 3000);
}

function toggleSubmenu(category) {
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => item.classList.remove('active'));
  const currentItem = document.querySelector(`#${category}`).parentElement;
  currentItem.classList.add('active');
}

function editProduct() {
  if (selectedProduct && selectedProduct.id && activeCategory) {
    openSidebar('edit', selectedProduct, selectedProductIndex);
  } else {
    showSnackbar('Ошибка: товар или категория не выбраны', 'error');
  }
}

function logout() {
  localStorage.clear();
  sessionStorage.clear();
  window.location.replace(`vkhod.html?nocache=${Date.now()}`);
}