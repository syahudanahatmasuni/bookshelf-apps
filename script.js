const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const searchInput = document.getElementById('searchBookTitle').value;
        searchBooksByTitle(searchInput);
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function addBook() {
    const textBookTitle = document.getElementById('inputBookTitle').value;
    const textBookAuthor = document.getElementById('inputBookAuthor').value;
    const textBookYear = document.getElementById('inputBookYear').value;

    const generatedID = generatedId();
    const isCompletedCheckbox = document.getElementById('inputBookIsComplete');
    const isCompleted = isCompletedCheckbox.checked;

    const bookObject = generaterBookObject(generatedID, textBookTitle, textBookAuthor, textBookYear, isCompleted);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generatedId() {
    return +new Date();
}

function generaterBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year: parseInt(year),
        isCompleted
    }
}

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBOOKList = document.getElementById('incompleteBookshelfList');
    uncompletedBOOKList.innerHTML = '';

    const completedBOOKList = document.getElementById('completeBookshelfList');
    completedBOOKList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isCompleted)
            uncompletedBOOKList.append(bookElement);
        else
            completedBOOKList.append(bookElement);
    }
});

function makeBook(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookObject.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = `Penulis : ${bookObject.author}`;

    const textYear = document.createElement('p');
    textYear.innerText = `Tahun : ${bookObject.year}`;

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('action');

    if (bookObject.isCompleted) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('green');
        undoButton.textContent = 'Belum Selesai Dibaca';

        undoButton.addEventListener('click', function () {
            undoTaskFromCompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('red');
        trashButton.textContent = 'Hapus Buku';

        trashButton.addEventListener('click', function () {
            removeTaskFromCompleted(bookObject.id);
        });

        buttonContainer.append(undoButton, trashButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('green');
        checkButton.textContent = 'Selesai Dibaca';

        checkButton.addEventListener('click', function () {
            addTaskToCompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('red');
        trashButton.textContent = 'Hapus Buku';

        trashButton.addEventListener('click', function () {
            removeTaskFromCompleted(bookObject.id);
        });

        buttonContainer.append(checkButton, trashButton);
    }

    const container = document.createElement('article');
    container.classList.add('book_item');
    container.append(textTitle, textAuthor, textYear, buttonContainer);
    container.setAttribute('id', `book-${bookObject.id}`);

    return container;
}

function addTaskToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeTaskFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}


function undoTaskFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
    alert("Data berhasil disimpan!!");
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function renderBooks(booksToRender, searchResult) {
    const bookList = document.getElementById(searchResult);
    bookList.innerHTML = ''; //

    booksToRender.forEach(book => {
        const bookItem = makeBook(book);
        bookList.appendChild(bookItem);
    });
}

function addBookButtonsEventListeners(bookElement, bookObject) {
    const undoButton = bookElement.querySelector('.green');
    const trashButton = bookElement.querySelector('.red');

    if (undoButton) {
        undoButton.addEventListener('click', function () {
            undoTaskFromCompleted(bookObject.id);
        });
    }

    if (trashButton) {
        trashButton.addEventListener('click', function () {
            removeTaskFromCompleted(bookObject.id);
        });
    }
}

function searchBooksByTitle(title) {
    const searchInput = title.toLowerCase();
    const filteredBooks = books.filter(book => book.title.toLowerCase().includes(searchInput));

    renderBooks(filteredBooks, 'searchResult');
}