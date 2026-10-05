const STORAGE_KEY = 'quicklist-items-v1';
const initialItems = [
  { id: 'initial-bread', name: 'Pão de forma', checked: false },
  { id: 'initial-coffee', name: 'Café preto', checked: false },
  { id: 'initial-juice', name: 'Suco de laranja', checked: false },
  { id: 'initial-cookies', name: 'Bolacha', checked: false },
];

const form = document.querySelector('#add-form');
const newItemInput = document.querySelector('#new-item');
const shoppingList = document.querySelector('#shopping-list');
const removeToast = document.querySelector('#remove-toast');
const dismissToast = document.querySelector('#dismiss-toast');
const backButton = document.querySelector('#back-button');

function loadItems() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return initialItems.map((item) => ({ ...item }));

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error('Lista inválida');

    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.checked === 'boolean'
    );
  } catch {
    return initialItems.map((item) => ({ ...item }));
  }
}

let items = loadItems();
let toastTimeout;

function saveItems() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // The list still works during this visit if browser storage is unavailable.
  }
}

function hideToast() {
  clearTimeout(toastTimeout);
  removeToast.hidden = true;
}

function showRemovalToast() {
  clearTimeout(toastTimeout);
  removeToast.hidden = false;
  toastTimeout = setTimeout(hideToast, 5000);
}

function renderItems() {
  shoppingList.replaceChildren();

  for (const item of items) {
    const row = document.createElement('li');
    row.className = 'shopping-item';

    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.checked;
    const updateCheckboxLabel = () => {
      checkbox.setAttribute(
        'aria-label',
        `${checkbox.checked ? 'Desmarcar' : 'Marcar'} ${item.name} como comprado`
      );
    };
    updateCheckboxLabel();
    checkbox.addEventListener('change', () => {
      item.checked = checkbox.checked;
      updateCheckboxLabel();
      saveItems();
    });

    const name = document.createElement('span');
    name.className = 'item-name';
    name.textContent = item.name;
    label.append(checkbox, name);

    const removeButton = document.createElement('button');
    removeButton.className = 'remove-button';
    removeButton.type = 'button';
    removeButton.setAttribute('aria-label', `Remover ${item.name}`);

    const removeIcon = document.createElement('img');
    removeIcon.src = 'assets/icons/Frame-3.svg';
    removeIcon.width = 20;
    removeIcon.height = 20;
    removeIcon.alt = '';
    removeButton.append(removeIcon);
    removeButton.addEventListener('click', () => {
      items = items.filter((listedItem) => listedItem.id !== item.id);
      saveItems();
      renderItems();
      showRemovalToast();
      newItemInput.focus();
    });

    row.append(label, removeButton);
    shoppingList.append(row);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = newItemInput.value.trim();
  if (!name) {
    newItemInput.focus();
    return;
  }

  items.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    checked: false,
  });
  saveItems();
  renderItems();
  newItemInput.value = '';
  newItemInput.focus();
  hideToast();
});

dismissToast.addEventListener('click', hideToast);
backButton.addEventListener('click', () => {
  if (window.history.length > 1) window.history.back();
});

renderItems();
