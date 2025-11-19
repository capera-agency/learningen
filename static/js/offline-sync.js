// Gestione sincronizzazione offline con IndexedDB
const DB_NAME = 'LearningManagerDB';
const DB_VERSION = 1;
const STORES = {
    COURSES: 'courses',
    LESSONS: 'lessons',
    PENDING_OPERATIONS: 'pending_operations',
    PREFERENCES: 'preferences'
};

let db = null;

// Inizializza IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('[Offline Sync] Errore apertura DB:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            console.log('[Offline Sync] DB inizializzato');
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Store per corsi
            if (!db.objectStoreNames.contains(STORES.COURSES)) {
                const courseStore = db.createObjectStore(STORES.COURSES, { keyPath: 'id' });
                courseStore.createIndex('code', 'code', { unique: false });
            }

            // Store per lezioni
            if (!db.objectStoreNames.contains(STORES.LESSONS)) {
                const lessonStore = db.createObjectStore(STORES.LESSONS, { keyPath: 'id' });
                lessonStore.createIndex('course_id', 'course_id', { unique: false });
            }

            // Store per operazioni pendenti
            if (!db.objectStoreNames.contains(STORES.PENDING_OPERATIONS)) {
                const opStore = db.createObjectStore(STORES.PENDING_OPERATIONS, { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
                opStore.createIndex('timestamp', 'timestamp', { unique: false });
                opStore.createIndex('type', 'type', { unique: false });
            }

            // Store per preferenze
            if (!db.objectStoreNames.contains(STORES.PREFERENCES)) {
                db.createObjectStore(STORES.PREFERENCES, { keyPath: 'key' });
            }
        };
    });
}

// Salva corso in IndexedDB
async function saveCourseToDB(course) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.COURSES], 'readwrite');
        const store = transaction.objectStore(STORES.COURSES);
        const request = store.put(course);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Ottieni tutti i corsi da IndexedDB
async function getCoursesFromDB() {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.COURSES], 'readonly');
        const store = transaction.objectStore(STORES.COURSES);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Salva lezione in IndexedDB
async function saveLessonToDB(lesson) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.LESSONS], 'readwrite');
        const store = transaction.objectStore(STORES.LESSONS);
        const request = store.put(lesson);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Ottieni lezioni per corso da IndexedDB
async function getLessonsFromDB(courseId) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.LESSONS], 'readonly');
        const store = transaction.objectStore(STORES.LESSONS);
        const index = store.index('course_id');
        const request = index.getAll(courseId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Aggiungi operazione alla coda
async function addPendingOperation(operation) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.PENDING_OPERATIONS], 'readwrite');
        const store = transaction.objectStore(STORES.PENDING_OPERATIONS);
        const op = {
            ...operation,
            timestamp: Date.now(),
            retries: 0
        };
        const request = store.add(op);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Ottieni tutte le operazioni pendenti
async function getPendingOperations() {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.PENDING_OPERATIONS], 'readonly');
        const store = transaction.objectStore(STORES.PENDING_OPERATIONS);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Rimuovi operazione dalla coda
async function removePendingOperation(id) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.PENDING_OPERATIONS], 'readwrite');
        const store = transaction.objectStore(STORES.PENDING_OPERATIONS);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Sincronizza operazioni pendenti
async function syncPendingOperations() {
    if (!navigator.onLine) {
        console.log('[Offline Sync] Offline, sincronizzazione rimandata');
        return;
    }

    const operations = await getPendingOperations();
    console.log(`[Offline Sync] Sincronizzazione ${operations.length} operazioni...`);

    for (const op of operations) {
        try {
            let response;
            
            switch (op.type) {
                case 'CREATE_COURSE':
                    response = await fetch('/api/courses', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(op.data)
                    });
                    break;
                    
                case 'UPDATE_COURSE':
                    response = await fetch(`/api/courses/${op.data.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(op.data)
                    });
                    break;
                    
                case 'DELETE_COURSE':
                    response = await fetch(`/api/courses/${op.data.id}`, {
                        method: 'DELETE'
                    });
                    break;
                    
                case 'CREATE_LESSON':
                    response = await fetch(`/api/courses/${op.data.course_id}/lessons`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(op.data)
                    });
                    break;
                    
                case 'UPDATE_LESSON':
                    response = await fetch(`/api/courses/${op.data.course_id}/lessons/${op.data.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(op.data)
                    });
                    break;
                    
                case 'DELETE_LESSON':
                    response = await fetch(`/api/courses/${op.data.course_id}/lessons/${op.data.id}`, {
                        method: 'DELETE'
                    });
                    break;
                    
                default:
                    console.warn('[Offline Sync] Tipo operazione sconosciuto:', op.type);
                    continue;
            }

            if (response.ok) {
                await removePendingOperation(op.id);
                console.log(`[Offline Sync] Operazione ${op.type} sincronizzata`);
            } else {
                op.retries++;
                if (op.retries >= 3) {
                    console.error(`[Offline Sync] Operazione ${op.type} fallita dopo 3 tentativi`);
                    await removePendingOperation(op.id);
                } else {
                    // Aggiorna retries
                    const transaction = db.transaction([STORES.PENDING_OPERATIONS], 'readwrite');
                    const store = transaction.objectStore(STORES.PENDING_OPERATIONS);
                    store.put(op);
                }
            }
        } catch (error) {
            console.error(`[Offline Sync] Errore sincronizzazione ${op.type}:`, error);
            op.retries++;
            if (op.retries >= 3) {
                await removePendingOperation(op.id);
            }
        }
    }

    // Ricarica i corsi dopo la sincronizzazione
    if (operations.length > 0) {
        if (typeof loadCourses === 'function') {
            loadCourses();
        }
    }
}

// Salva preferenze in IndexedDB
async function savePreferenceToDB(key, value) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.PREFERENCES], 'readwrite');
        const store = transaction.objectStore(STORES.PREFERENCES);
        const request = store.put({ key, value });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Ottieni preferenza da IndexedDB
async function getPreferenceFromDB(key) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.PREFERENCES], 'readonly');
        const store = transaction.objectStore(STORES.PREFERENCES);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result?.value);
        request.onerror = () => reject(request.error);
    });
}

// Esporta funzioni per uso globale
window.offlineSync = {
    initDB,
    saveCourseToDB,
    getCoursesFromDB,
    saveLessonToDB,
    getLessonsFromDB,
    addPendingOperation,
    getPendingOperations,
    removePendingOperation,
    syncPendingOperations,
    savePreferenceToDB,
    getPreferenceFromDB
};

