let currentCourseId = null;
let editingCourseId = null;
const API_BASE = '/api';
let lessonDatePicker = null; // Istanza del datepicker

// Funzione per formattare le date in formato italiano
function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            // Se è una stringa YYYY-MM-DD, parsala manualmente
            const parts = dateString.split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1;
                const day = parseInt(parts[2]);
                const d = new Date(year, month, day);
                return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
            }
            return dateString;
        }
        return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
        return dateString;
    }
}

// Funzione per formattare data e ora in formato italiano (con correzione fuso orario)
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    try {
        // Se la stringa termina con 'Z' o ha il formato ISO, gestiscila come UTC
        let date;
        if (typeof dateString === 'string' && (dateString.endsWith('Z') || dateString.includes('T'))) {
            // Parse come UTC e poi converti al fuso orario locale
            date = new Date(dateString);
        } else {
            date = new Date(dateString);
        }
        
        if (isNaN(date.getTime())) {
            return dateString;
        }
        
        // Usa toLocaleString con fuso orario italiano
        return date.toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Rome'
        });
    } catch (e) {
        return dateString;
    }
}

// Carica corsi all'avvio
document.addEventListener('DOMContentLoaded', async () => {
    // Carica preferenze prima dei corsi per avere hourlyRate disponibile
    await loadPreferences();
    loadCourses();
    
    // Configura ricalcolo automatico delle ore
    setupHoursRecalculation();
    
    // Rimuovi backdrop se rimane dopo la chiusura delle modali
    const modals = ['courseModal', 'lessonsModal', 'lessonPreviewModal', 'questionsModal', 'finalReportModal', 'trainAIModal', 'preferencesModal', 'notificationsModal', 'collaborationModal', 'versionHistoryModal', 'versionCompareModal', 'aiAnalysisModal', 'exportModal'];
    modals.forEach(modalId => {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            modalElement.addEventListener('hidden.bs.modal', function() {
                // Rimuovi il focus da qualsiasi elemento all'interno della modale
                const activeElement = document.activeElement;
                if (activeElement && this.contains(activeElement)) {
                    activeElement.blur();
                }
                
                // Rimuovi backdrop se presente
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(backdrop => backdrop.remove());
                // Rimuovi classe modal-open dal body
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
            });
            
            // Gestisci anche l'evento hide per rimuovere il focus prima che aria-hidden venga impostato
            modalElement.addEventListener('hide.bs.modal', function() {
                const activeElement = document.activeElement;
                if (activeElement && this.contains(activeElement)) {
                    activeElement.blur();
                }
            });
        }
    });
});

async function newCourse() {
    editingCourseId = null;
    document.getElementById('courseForm').reset();
    document.querySelector('#courseModal .modal-title').textContent = 'Nuovo Corso';
    
    // Reset modal mode
    document.getElementById('modeManual').checked = true;
    document.getElementById('manualForm').style.display = 'block';
    document.getElementById('mdForm').style.display = 'none';
    document.getElementById('saveCourseBtn').onclick = saveCourse;
    
    // Reset valori ore
    document.getElementById('theoryHours').value = '';
    document.getElementById('practiceHours').value = '';
    document.getElementById('totalHours').value = '';
    
    // Mostra il modal prima di caricare i file
    const modal = new bootstrap.Modal(document.getElementById('courseModal'));
    modal.show();
    
    // Carica file MD disponibili (anche se il form MD non è visibile)
    try {
        await loadMDFiles();
    } catch (error) {
        console.error('Errore nel caricamento file MD:', error);
    }
}

async function loadMDFiles() {
    const select = document.getElementById('mdFileSelect');
    if (!select) {
        console.error('Elemento mdFileSelect non trovato');
        return;
    }
    
    select.innerHTML = '<option value="">Caricamento file...</option>';
    
    try {
        const response = await fetch(`${API_BASE}/md-files`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const files = await response.json();
        
        select.innerHTML = '<option value="">Seleziona un file...</option>';
        
        if (files.length === 0) {
            select.innerHTML = '<option value="">Nessun file MD trovato nella cartella MD/</option>';
            return;
        }
        
        files.forEach(file => {
            const option = document.createElement('option');
            option.value = file.filename;
            option.textContent = `${file.filename} (${file.size_kb} KB)`;
            select.appendChild(option);
        });
        
        // Event listener per selezione file
        select.onchange = function() {
            if (this.value) {
                document.getElementById('mdFileName').textContent = this.value;
                document.getElementById('mdFileInfo').style.display = 'block';
            } else {
                document.getElementById('mdFileInfo').style.display = 'none';
            }
        };
    } catch (error) {
        console.error('Errore nel caricamento file MD:', error);
        select.innerHTML = `<option value="">Errore nel caricamento: ${error.message}</option>`;
    }
}

// Gestione cambio modalità
document.addEventListener('DOMContentLoaded', () => {
    const modeRadios = document.querySelectorAll('input[name="courseMode"]');
    modeRadios.forEach(radio => {
        radio.addEventListener('change', async function() {
            if (this.value === 'manual') {
                document.getElementById('manualForm').style.display = 'block';
                document.getElementById('mdForm').style.display = 'none';
                document.getElementById('saveCourseBtn').onclick = saveCourse;
            } else {
                document.getElementById('manualForm').style.display = 'none';
                document.getElementById('mdForm').style.display = 'block';
                document.getElementById('saveCourseBtn').onclick = createCourseFromMD;
                // Carica i file MD quando si passa alla modalità MD
                try {
                    await loadMDFiles();
                } catch (error) {
                    console.error('Errore nel caricamento file MD:', error);
                }
            }
        });
    });
});

let isSearchMode = false;
let currentSearchResults = [];

async function loadCourses() {
    try {
        const response = await fetch(`${API_BASE}/courses`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const courses = await response.json();
        isSearchMode = false;
        currentSearchResults = [];
        displayCourses(courses);
        
        // Rimuovi badge risultati se presente
        const badge = document.getElementById('searchResultsBadge');
        if (badge) badge.remove();
    } catch (error) {
        console.error('Errore nel caricamento corsi:', error);
        const container = document.getElementById('coursesList');
        container.innerHTML = `<div class="col-12"><div class="alert alert-danger">Errore nel caricamento dei corsi: ${error.message}. <a href="/health" target="_blank">Verifica lo stato del server</a></div></div>`;
    }
}

function toggleSearchPanel() {
    const panel = document.getElementById('searchPanel');
    const toggleBtn = document.getElementById('toggleSearchBtn');
    const btnText = document.getElementById('searchBtnText');
    
    if (panel.style.display === 'none' || !panel.style.display) {
        panel.style.display = 'block';
        if (btnText) btnText.textContent = 'Chiudi Ricerca';
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="bi bi-x-circle"></i> <span id="searchBtnText">Chiudi Ricerca</span>';
        }
        loadSavedSearches();
    } else {
        panel.style.display = 'none';
        if (btnText) btnText.textContent = 'Ricerca';
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="bi bi-search"></i> <span id="searchBtnText">Ricerca</span>';
        }
        // Se si chiude il pannello, ricarica tutti i corsi
        if (isSearchMode) {
            clearSearch();
        }
    }
}

async function performSearch() {
    const query = document.getElementById('searchQuery').value.trim();
    const lessonType = document.getElementById('filterLessonType').value;
    const minDuration = document.getElementById('filterDuration').value;
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;
    
    // Costruisci URL con parametri
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (lessonType) params.append('lesson_type', lessonType);
    if (minDuration) params.append('min_duration', minDuration);
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    params.append('search_in_content', 'true');
    
    try {
        const response = await fetch(`${API_BASE}/courses/search?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Errore nella ricerca');
        }
        
        const data = await response.json();
        isSearchMode = true;
        currentSearchResults = data.results;
        
        // Salva la ricerca se ha un testo
        if (query) {
            saveSearch(query, params.toString());
        }
        
        // Mostra risultati
        if (data.count === 0 && (!data.matched_lessons || data.matched_lessons.length === 0)) {
            document.getElementById('coursesList').innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle"></i> Nessun risultato trovato per la ricerca.
                    </div>
                </div>
            `;
        } else {
            // Mostra corsi e lezioni trovate
            displaySearchResults(data.results, data.matched_lessons || []);
            // Mostra badge con numero risultati
            const totalResults = data.count + (data.lessons_count || 0);
            showSearchResultsBadge(data.count, data.lessons_count || 0);
        }
        
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore durante la ricerca: ' + error.message);
    }
}

function showSearchResultsBadge(coursesCount, lessonsCount) {
    // Crea o aggiorna badge risultati
    let badge = document.getElementById('searchResultsBadge');
    if (!badge) {
        badge = document.createElement('div');
        badge.id = 'searchResultsBadge';
        badge.className = 'alert alert-primary mb-3';
        const container = document.getElementById('coursesList').parentElement;
        container.insertBefore(badge, document.getElementById('coursesList'));
    }
    const totalCount = coursesCount + lessonsCount;
    let countText = '';
    if (coursesCount > 0 && lessonsCount > 0) {
        countText = `<strong>${coursesCount}</strong> corso/i e <strong>${lessonsCount}</strong> lezione/i`;
    } else if (coursesCount > 0) {
        countText = `<strong>${coursesCount}</strong> corso/i`;
    } else if (lessonsCount > 0) {
        countText = `<strong>${lessonsCount}</strong> lezione/i`;
    }
    badge.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <span><i class="bi bi-search"></i> Trovati ${countText} (${totalCount} totali)</span>
            <button class="btn btn-sm btn-outline-primary" onclick="clearSearch()">
                <i class="bi bi-x"></i> Mostra Tutti
            </button>
        </div>
    `;
}

function displaySearchResults(courses, matchedLessons) {
    const container = document.getElementById('coursesList');
    let html = '';
    
    // Pulsante per tornare alla vista normale
    html += `
        <div class="col-12 mb-3">
            <button class="btn btn-outline-secondary" onclick="clearSearch()">
                <i class="bi bi-arrow-left"></i> Torna alla Vista Corsi
            </button>
        </div>
    `;
    
    // Nella vista ricerca NON mostriamo le card dei corsi, solo le lezioni trovate
    // Mostra lezioni trovate
    if (matchedLessons && matchedLessons.length > 0) {
        // Raggruppa lezioni per corso
        const lessonsByCourse = {};
        matchedLessons.forEach(lesson => {
            if (!lessonsByCourse[lesson.course_id]) {
                lessonsByCourse[lesson.course_id] = [];
            }
            lessonsByCourse[lesson.course_id].push(lesson);
        });
        
        // Mostra lezioni trovate
        html += '<div class="col-12 mb-4"><h5 class="mb-3"><i class="bi bi-list-check"></i> Lezioni Trovate</h5></div>';
        
        Object.keys(lessonsByCourse).forEach(courseId => {
            const courseLessons = lessonsByCourse[courseId];
            const firstLesson = courseLessons[0];
            
            html += `
                <div class="col-12 mb-3">
                    <div class="card">
                        <div class="card-header bg-light">
                            <h6 class="mb-0">
                                <i class="bi bi-book"></i> ${firstLesson.course_name} (${firstLesson.course_code})
                            </h6>
                        </div>
                        <div class="card-body">
                            ${courseLessons.map(lesson => {
                                const dateBadge = lesson.lesson_date 
                                    ? `<span class="badge bg-info me-2">${new Date(lesson.lesson_date).toLocaleDateString('it-IT')}</span>`
                                    : '';
                                const typeBadge = lesson.lesson_type === 'theory' 
                                    ? '<span class="badge bg-primary me-2">Teoria</span>'
                                    : '<span class="badge bg-success me-2">Pratica</span>';
                                const matchBadges = lesson.match_reasons.map(reason => {
                                    const labels = {
                                        'titolo': 'Titolo',
                                        'descrizione': 'Descrizione',
                                        'contenuto': 'Contenuto'
                                    };
                                    return `<span class="badge bg-warning text-dark me-1">${labels[reason] || reason}</span>`;
                                }).join('');
                                
                                let snippetHtml = '';
                                if (lesson.content_snippet) {
                                    // Evidenzia il testo trovato nel snippet
                                    const query = document.getElementById('searchQuery').value.trim();
                                    let highlightedSnippet = lesson.content_snippet;
                                    if (query) {
                                        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                                        highlightedSnippet = highlightedSnippet.replace(regex, '<mark>$1</mark>');
                                    }
                                    snippetHtml = `
                                        <div class="mt-2 p-2 bg-light rounded">
                                            <small class="text-muted">Snippet contenuto:</small>
                                            <p class="mb-0 small">${highlightedSnippet}</p>
                                        </div>
                                    `;
                                }
                                
                                return `
                                    <div class="border-bottom pb-3 mb-3">
                                        <div class="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <h6 class="mb-1">${lesson.order}. ${lesson.title}</h6>
                                                <div class="mb-2">
                                                    ${dateBadge}
                                                    ${typeBadge}
                                                    ${matchBadges}
                                                    <span class="badge bg-secondary">${lesson.duration_hours}h</span>
                                                </div>
                                                ${lesson.description ? `<p class="text-muted small mb-2">${lesson.description}</p>` : ''}
                                            </div>
                                            <button class="btn btn-sm btn-outline-primary" onclick="openLessonsModal(${firstLesson.course_id})">
                                                <i class="bi bi-eye"></i> Vedi Lezione
                                            </button>
                                        </div>
                                        ${snippetHtml}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
        });
    }
    
    container.innerHTML = html || '<div class="col-12"><div class="alert alert-info">Nessun risultato trovato.</div></div>';
}

function clearSearch() {
    document.getElementById('searchQuery').value = '';
    document.getElementById('filterLessonType').value = '';
    document.getElementById('filterDuration').value = '';
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
    
    const badge = document.getElementById('searchResultsBadge');
    if (badge) badge.remove();
    
    isSearchMode = false;
    currentSearchResults = [];
    loadCourses();
}

function clearFilters() {
    clearSearch();
}

function saveSearch(query, params) {
    try {
        let searches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
        
        // Evita duplicati
        const existingIndex = searches.findIndex(s => s.query === query);
        if (existingIndex >= 0) {
            searches.splice(existingIndex, 1);
        }
        
        // Aggiungi in cima
        searches.unshift({
            query: query,
            params: params,
            timestamp: new Date().toISOString()
        });
        
        // Mantieni solo le ultime 10
        searches = searches.slice(0, 10);
        
        localStorage.setItem('savedSearches', JSON.stringify(searches));
        loadSavedSearches();
    } catch (error) {
        console.error('Errore nel salvataggio ricerca:', error);
    }
}

function loadSavedSearches() {
    try {
        const searches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
        const container = document.getElementById('savedSearches');
        
        if (!container) return;
        
        if (searches.length === 0) {
            container.innerHTML = '<small class="text-muted">Nessuna ricerca salvata</small>';
            return;
        }
        
        container.innerHTML = searches.map((search, index) => {
            const date = new Date(search.timestamp);
            const escapedQuery = search.query.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            return `
                <button class="btn btn-sm btn-outline-secondary" onclick="loadSavedSearch('${escapedQuery}')" title="${date.toLocaleString('it-IT')}">
                    <i class="bi bi-clock-history"></i> ${search.query.substring(0, 30)}${search.query.length > 30 ? '...' : ''}
                </button>
            `;
        }).join('');
    } catch (error) {
        console.error('Errore nel caricamento ricerche salvate:', error);
    }
}

function loadSavedSearch(query) {
    document.getElementById('searchQuery').value = query;
    performSearch();
}

function displayCourses(courses, returnHtml = false) {
    const container = document.getElementById('coursesList');
    if (courses.length === 0) {
        const emptyMsg = '<div class="col-12"><div class="alert alert-info">Nessun corso disponibile. Crea il primo corso!</div></div>';
        if (returnHtml) return emptyMsg;
        container.innerHTML = emptyMsg;
        return '';
    }

    const html = courses.map((course, index) => {
        // Seleziona un gradiente basato sull'ID del corso per varietà
        const gradientClass = `gradient-${(course.id % 10) + 1}`;
        
        return `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card course-card h-100">
                <div class="card-header course-header ${gradientClass}">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h5 class="card-title mb-1">${course.name}</h5>
                            <p class="card-code mb-0">${course.code}</p>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <p class="card-description">${course.description || '<em class="text-muted">Nessuna descrizione</em>'}</p>
                    
                    <div class="course-stats mb-3">
                        <div class="stat-item">
                            <i class="bi bi-clock"></i>
                            <span class="stat-value">${course.total_hours}h</span>
                            <span class="stat-label">totali</span>
                        </div>
                        <div class="stat-item">
                            <i class="bi bi-book"></i>
                            <span class="stat-value">${course.theory_hours}h</span>
                            <span class="stat-label">teoria</span>
                        </div>
                        <div class="stat-item">
                            <i class="bi bi-laptop"></i>
                            <span class="stat-value">${course.practice_hours}h</span>
                            <span class="stat-label">pratica</span>
                        </div>
                    </div>
                    
                    <div class="course-lessons mb-3">
                        <i class="bi bi-list-check"></i>
                        <strong>${course.num_lessons || course.lessons_count || 0}</strong> lezioni
                    </div>
                    
                    ${(course.start_date || course.end_date) ? `
                    <div class="course-dates mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <div class="flex-grow-1">
                                ${course.start_date ? `
                                    <div class="date-item">
                                        <i class="bi bi-calendar-event"></i>
                                        <span class="date-label">Inizio:</span>
                                        <span class="date-value">${formatDate(course.start_date)}</span>
                                    </div>
                                ` : ''}
                                ${course.end_date ? `
                                    <div class="date-item">
                                        <i class="bi bi-calendar-check"></i>
                                        <span class="date-label">Fine:</span>
                                        <span class="date-value">${formatDate(course.end_date)}</span>
                                    </div>
                                ` : ''}
                            </div>
                            <button class="btn btn-sm btn-outline-primary ms-2" onclick="exportCourseCalendar(${course.id}, '${course.name.replace(/'/g, "\\'")}')" title="Esporta calendario ICS">
                                <i class="bi bi-calendar-plus"></i> ICS
                            </button>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="course-import mb-3">
                        <div class="import-box p-3 bg-light border rounded">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <i class="bi bi-cash-coin text-success"></i>
                                    <strong class="ms-2">Importi</strong>
                                </div>
                                <div class="text-end">
                                    <div class="import-total h5 mb-0 text-success">
                                        €${((course.total_hours || 0) * (appPreferences.hourlyRate || 25)).toFixed(2)}
                                    </div>
                                    <small class="text-muted">
                                        ${course.total_hours || 0}h × €${(appPreferences.hourlyRate || 25).toFixed(2)}/h
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3 d-flex gap-2">
                        <button class="btn btn-sm btn-success flex-fill" onclick="createSlides(${course.id}, '${course.name.replace(/'/g, "\\'")}')" title="Crea Presentazione PowerPoint">
                            <i class="bi bi-file-slides"></i> Crea Slide
                        </button>
                        <button class="btn btn-sm btn-info flex-fill" onclick="showAIAnalysisModal(${course.id}, '${course.name.replace(/'/g, "\\'")}')" title="Analisi e Suggerimenti AI">
                            <i class="bi bi-graph-up-arrow"></i> Analisi AI
                        </button>
                        <!-- Funzione Canva in standby
                        <button class="btn btn-sm btn-primary flex-fill" onclick="createWithCanva(${course.id}, '${course.name.replace(/'/g, "\\'")}')" title="Crea Presentazione su Canva">
                            <i class="bi bi-palette"></i> Crea con Canva
                        </button>
                        -->
                    </div>
                    
                    <div class="course-actions">
                        <button class="btn btn-sm btn-primary w-100 mb-2" onclick="openLessonsModal(${course.id})">
                            <i class="bi bi-list-ul"></i> Gestisci Lezioni
                        </button>
                        <div class="btn-group w-100 mb-2" role="group">
                            <button class="btn btn-sm btn-warning" onclick="editCourse(${course.id})" title="Modifica">
                                <i class="bi bi-pencil"></i> Modifica
                            </button>
                            <button class="btn btn-sm btn-info train-ai-btn" data-course-id="${course.id}" data-course-name="${course.name.replace(/"/g, '&quot;')}" title="Addestra AI su tutte le lezioni">
                                <i class="bi bi-robot"></i> Addestra AI
                            </button>
                            <button class="btn btn-sm btn-danger" data-course-id="${course.id}" data-course-name="${course.name.replace(/"/g, '&quot;')}" onclick="deleteCourseFromButton(this)" title="Elimina">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                        <div class="btn-group w-100" role="group">
                            <button class="btn btn-sm btn-outline-primary" onclick="saveAsTemplate(${course.id}, '${course.name.replace(/'/g, "\\'")}')" title="Salva come Template">
                                <i class="bi bi-bookmark"></i> Template
                            </button>
                            <button class="btn btn-sm btn-outline-primary" onclick="duplicateCourse(${course.id}, '${course.name.replace(/'/g, "\\'")}')" title="Duplica Corso">
                                <i class="bi bi-files"></i> Duplica
                            </button>
                            <button class="btn btn-sm btn-outline-success" onclick="showExportModal(${course.id}, '${course.name.replace(/'/g, "\\'")}')" title="Esporta Corso">
                                <i class="bi bi-download"></i> Esporta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    }).join('');
    
    if (returnHtml) {
        return html;
    }
    
    container.innerHTML = html;
    
    // Aggiungi event listener per i pulsanti "Addestra AI"
    container.querySelectorAll('.train-ai-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const courseId = parseInt(this.getAttribute('data-course-id'));
            const courseName = this.getAttribute('data-course-name');
            trainAIOnCourse(courseId, courseName, this);
        });
    });
    
    return '';
}

async function editCourse(courseId) {
    editingCourseId = courseId;
    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}`);
        const course = await response.json();
        
        document.getElementById('courseCode').value = course.code;
        document.getElementById('courseName').value = course.name;
        document.getElementById('courseDescription').value = course.description || '';
        document.getElementById('theoryHours').value = course.theory_hours;
        document.getElementById('practiceHours').value = course.practice_hours;
        document.getElementById('numLessons').value = course.num_lessons || 0;
        
        // Ricalcola le ore totali basandosi su teoria + pratica
        const totalHours = (parseFloat(course.theory_hours) || 0) + (parseFloat(course.practice_hours) || 0);
        document.getElementById('totalHours').value = totalHours;
        
        document.querySelector('#courseModal .modal-title').textContent = 'Modifica Corso';
        const modal = new bootstrap.Modal(document.getElementById('courseModal'));
        modal.show();
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nel caricamento del corso');
    }
}

function deleteCourseFromButton(button) {
    const courseId = button.getAttribute('data-course-id');
    const courseName = button.getAttribute('data-course-name');
    deleteCourse(parseInt(courseId), courseName);
}

async function deleteCourse(courseId, courseName) {
    if (!confirm(`Sei sicuro di voler eliminare il corso "${courseName}"?\n\nQuesta operazione eliminerà anche tutte le lezioni associate e non può essere annullata.`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadCourses();
            alert('Corso eliminato con successo!');
        } else {
            const result = await response.json();
            alert(`Errore nell'eliminazione del corso: ${result.error || 'Errore sconosciuto'}`);
        }
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nella comunicazione con il server');
    }
}

async function createCourseFromMD() {
    const filename = document.getElementById('mdFileSelect').value;
    
    if (!filename) {
        alert('Seleziona un file Markdown');
        return;
    }
    
    if (!confirm(`Creare il corso dal file "${filename}"?\n\nIl corso verrà creato automaticamente con tutte le lezioni estratte dal file.`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/courses/from-md`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: filename })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('courseModal'));
            modal.hide();
            document.getElementById('courseForm').reset();
            document.getElementById('mdFileSelect').value = '';
            document.getElementById('mdFileInfo').style.display = 'none';
            loadCourses();
            alert(`${result.message}\n\n${result.lessons_count} lezioni create.`);
        } else if (response.status === 409) {
            // Corso esistente - chiedi conferma per sovrascrivere
            if (confirm(`${result.error}\n\nVuoi sovrascrivere il corso esistente? Tutte le lezioni attuali verranno eliminate e sostituite.`)) {
                // Richiedi di nuovo con flag overwrite
                const overwriteResponse = await fetch(`${API_BASE}/courses/from-md`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: filename, overwrite: true })
                });
                
                const overwriteResult = await overwriteResponse.json();
                
                if (overwriteResponse.ok) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('courseModal'));
                    modal.hide();
                    document.getElementById('courseForm').reset();
                    document.getElementById('mdFileSelect').value = '';
                    document.getElementById('mdFileInfo').style.display = 'none';
                    loadCourses();
                    alert(`${overwriteResult.message}\n\n${overwriteResult.lessons_count} lezioni create.`);
                } else {
                    alert(`Errore: ${overwriteResult.error}`);
                }
            }
        } else {
            alert(`Errore: ${result.error}`);
        }
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nella comunicazione con il server');
    }
}

async function saveCourse() {
    const courseData = {
        code: document.getElementById('courseCode').value,
        name: document.getElementById('courseName').value,
        description: document.getElementById('courseDescription').value,
        total_hours: parseInt(document.getElementById('totalHours').value),
        theory_hours: parseInt(document.getElementById('theoryHours').value),
        practice_hours: parseInt(document.getElementById('practiceHours').value),
        num_lessons: parseInt(document.getElementById('numLessons').value) || 0
    };

    try {
        const url = editingCourseId 
            ? `${API_BASE}/courses/${editingCourseId}`
            : `${API_BASE}/courses`;
        const method = editingCourseId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(courseData)
        });

        if (response.ok) {
            const isEdit = !!editingCourseId;
            const modal = bootstrap.Modal.getInstance(document.getElementById('courseModal'));
            modal.hide();
            document.getElementById('courseForm').reset();
            document.querySelector('#courseModal .modal-title').textContent = 'Nuovo Corso';
            editingCourseId = null;
            loadCourses();
            alert(isEdit ? 'Corso aggiornato con successo!' : 'Corso creato con successo!');
        } else {
            alert(editingCourseId ? 'Errore nell\'aggiornamento del corso' : 'Errore nella creazione del corso');
        }
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nella comunicazione con il server');
    }
}

async function openLessonsModal(courseId) {
    currentCourseId = courseId;
    const modal = new bootstrap.Modal(document.getElementById('lessonsModal'));
    
    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}`);
        const course = await response.json();
        
        const numLessons = course.num_lessons || 0;
        const actualLessons = course.lessons ? course.lessons.length : 0;
        const titleText = numLessons > 0 
            ? `Lezioni - ${course.name} (${actualLessons}/${numLessons})`
            : `Lezioni - ${course.name} (${actualLessons})`;
        
        document.getElementById('lessonsModalTitle').textContent = titleText;
        displayLessons(course.lessons);
        
        // Nascondi il form all'apertura
        document.getElementById('lessonFormContainer').style.display = 'none';
        document.getElementById('lessonForm').reset();
        document.getElementById('lessonId').value = '';
        
        modal.show();
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nel caricamento delle lezioni');
    }
}

function displayLessons(lessons) {
    const container = document.getElementById('lessonsList');
    if (lessons.length === 0) {
        container.innerHTML = '<div class="alert alert-info">Nessuna lezione. Aggiungi la prima lezione!</div>';
        return;
    }

    // Mostra quante lezioni sono visualizzate
    const lessonsCount = `<div class="mb-2"><small class="text-muted">Visualizzate ${lessons.length} lezioni</small></div>`;
    
    container.innerHTML = lessonsCount + lessons.map(lesson => {
        // Formatta la data se presente
        let dateDisplay = '';
        
        if (lesson.lesson_date) {
            try {
                // Gestisce sia formato ISO (YYYY-MM-DD) che altri formati
                let date;
                if (typeof lesson.lesson_date === 'string' && lesson.lesson_date.includes('T')) {
                    date = new Date(lesson.lesson_date);
                } else if (typeof lesson.lesson_date === 'string') {
                    // Se è una stringa YYYY-MM-DD, crea la data correttamente
                    const parts = lesson.lesson_date.split('-');
                    if (parts.length === 3) {
                        const year = parseInt(parts[0]);
                        const month = parseInt(parts[1]) - 1; // I mesi in JS sono 0-based
                        const day = parseInt(parts[2]);
                        date = new Date(year, month, day);
                    } else {
                        date = new Date(lesson.lesson_date);
                    }
                } else {
                    date = new Date(lesson.lesson_date);
                }
                
                // Verifica che la data sia valida
                if (!isNaN(date.getTime())) {
                    const formattedDate = date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    dateDisplay = `<span class="badge bg-info ms-1"><i class="bi bi-calendar"></i> ${formattedDate}</span>`;
                }
            } catch (e) {
                console.error('Errore nella formattazione della data:', e, lesson.lesson_date);
            }
        }
        
        return `
        <div class="lesson-item ${lesson.lesson_type}" data-lesson-id="${lesson.id}" data-lesson-order="${lesson.order}">
            <div class="d-flex justify-content-between align-items-start">
                <div class="d-flex align-items-start flex-grow-1" style="margin-left: 0;">
                    <div class="drag-handle" style="cursor: move; color: #6c757d; flex-shrink: 0; padding: 0.5rem 0.25rem;">
                        <i class="bi bi-grip-vertical" style="font-size: 1.2rem;"></i>
                    </div>
                    <div class="flex-grow-1" style="margin-left: 0;">
                        <h6 class="mb-1" style="margin-left: 0;">${lesson.order}. ${lesson.title}</h6>
                        ${lesson.description ? `<p class="mb-1 small" style="margin-left: 0;">${lesson.description}</p>` : ''}
                        <div style="margin-left: 0;">
                            <span class="badge badge-type ${lesson.lesson_type === 'theory' ? 'bg-success' : 'bg-danger'}">
                                ${lesson.lesson_type === 'theory' ? 'Teorica' : 'Pratica'}
                            </span>
                            <span class="badge bg-secondary">${lesson.duration_hours}h</span>
                            ${dateDisplay}
                        </div>
                    </div>
                </div>
                <div class="d-flex gap-1 flex-wrap flex-shrink-0 ms-2">
                    <button class="btn btn-sm btn-outline-info preview-lesson-btn" data-lesson-id="${lesson.id}" data-lesson-title="${(lesson.title || '').replace(/"/g, '&quot;')}" title="Anteprima">
                        <i class="bi bi-eye"></i>
                    </button>
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" title="Esporta">
                            <i class="bi bi-download"></i>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item export-lesson-btn" href="#" data-lesson-id="${lesson.id}" data-format="pdf"><i class="bi bi-file-pdf"></i> Esporta PDF</a></li>
                            <li><a class="dropdown-item export-lesson-btn" href="#" data-lesson-id="${lesson.id}" data-format="docx"><i class="bi bi-file-word"></i> Esporta DOCX</a></li>
                        </ul>
                    </div>
                    <button class="btn btn-sm btn-outline-primary" onclick="editLesson(${lesson.id})" title="Modifica">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success expand-chatgpt-btn" data-lesson-id="${lesson.id}" data-lesson-title="${(lesson.title || '').replace(/"/g, '&quot;')}" title="Espandi con ChatGPT">
                        <i class="bi bi-magic"></i> ChatGPT
                    </button>
                    <button class="btn btn-sm btn-outline-secondary version-history-btn" data-lesson-id="${lesson.id}" data-course-id="${currentCourseId}" title="Cronologia Versioni">
                        <i class="bi bi-clock-history"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info collaboration-btn" data-lesson-id="${lesson.id}" data-course-id="${currentCourseId}" title="Note, Commenti e Promemoria">
                        <i class="bi bi-chat-dots"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-lesson-btn" data-lesson-id="${lesson.id}" data-lesson-title="${(lesson.title || '').replace(/"/g, '&quot;')}" title="Elimina">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    // Inizializza drag & drop con SortableJS
    if (typeof Sortable !== 'undefined') {
        const sortable = new Sortable(container, {
            handle: '.drag-handle',
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: async function(evt) {
                // Aggiorna l'ordine delle lezioni
                const lessonItems = container.querySelectorAll('.lesson-item');
                const newOrder = [];
                lessonItems.forEach((item, index) => {
                    const lessonId = parseInt(item.getAttribute('data-lesson-id'));
                    newOrder.push({
                        lesson_id: lessonId,
                        order: index + 1
                    });
                });
                
                // Aggiorna l'ordine nel database
                await updateLessonsOrder(currentCourseId, newOrder);
                
                // Aggiorna i numeri di ordine visualizzati
                lessonItems.forEach((item, index) => {
                    const h6 = item.querySelector('h6');
                    if (h6) {
                        const title = h6.textContent.replace(/^\d+\.\s*/, '');
                        h6.textContent = `${index + 1}. ${title}`;
                    }
                    item.setAttribute('data-lesson-order', index + 1);
                });
            }
        });
    }
    
    // Aggiungi event listener per i pulsanti ChatGPT
    container.querySelectorAll('.expand-chatgpt-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lessonId = parseInt(this.getAttribute('data-lesson-id'));
            const lessonTitle = this.getAttribute('data-lesson-title');
            expandLessonWithChatGPT(lessonId, lessonTitle, this);
        });
    });
    
    // Aggiungi event listener per i pulsanti Anteprima
    container.querySelectorAll('.preview-lesson-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lessonId = parseInt(this.getAttribute('data-lesson-id'));
            showLessonPreview(lessonId);
        });
    });
    
    // Aggiungi event listener per i pulsanti Esporta
    container.querySelectorAll('.export-lesson-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const lessonId = parseInt(this.getAttribute('data-lesson-id'));
            const format = this.getAttribute('data-format');
            exportLesson(lessonId, format);
        });
    });
    
    // Aggiungi event listener per i pulsanti Elimina Lezione
    container.querySelectorAll('.delete-lesson-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lessonId = parseInt(this.getAttribute('data-lesson-id'));
            const lessonTitle = this.getAttribute('data-lesson-title');
            deleteLesson(lessonId, lessonTitle);
        });
    });
    
    // Aggiungi event listener per i pulsanti Cronologia Versioni
    container.querySelectorAll('.version-history-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lessonId = parseInt(this.getAttribute('data-lesson-id'));
            const courseId = parseInt(this.getAttribute('data-course-id'));
            showVersionHistory(courseId, lessonId);
        });
    });
    
    // Aggiungi event listener per i pulsanti Collaborazione
    container.querySelectorAll('.collaboration-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lessonId = parseInt(this.getAttribute('data-lesson-id'));
            const courseId = parseInt(this.getAttribute('data-course-id'));
            showCollaborationModal(courseId, lessonId);
        });
    });
}

async function updateLessonsOrder(courseId, newOrder) {
    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}/lessons/reorder`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: newOrder })
        });
        
        if (response.ok) {
            // Mostra un toast di successo invece di alert
            showToast('Ordine lezioni aggiornato con successo', 'success');
        } else {
            const error = await response.json();
            console.error('Errore nell\'aggiornamento ordine:', error);
            showToast('Errore nell\'aggiornamento dell\'ordine', 'error');
        }
    } catch (error) {
        console.error('Errore:', error);
        showToast('Errore nella comunicazione con il server', 'error');
    }
}

function showToast(message, type = 'info') {
    // Crea un toast notification semplice
    const toast = document.createElement('div');
    toast.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} alert-dismissible fade show position-fixed`;
    toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(toast);
    
    // Rimuovi dopo 3 secondi
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

async function showVersionHistory(courseId, lessonId) {
    const modal = new bootstrap.Modal(document.getElementById('versionHistoryModal'));
    const content = document.getElementById('versionHistoryContent');
    
    content.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Caricamento...</span></div></div>';
    modal.show();
    
    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonId}/versions`);
        if (!response.ok) throw new Error('Errore nel caricamento delle versioni');
        
        const data = await response.json();
        
        let html = `
            <div class="mb-3">
                <h6>Versione Corrente</h6>
                <div class="card mb-3">
                    <div class="card-body">
                        <h6 class="card-title">${data.current_version.title}</h6>
                        <small class="text-muted">Ultimo aggiornamento: ${formatDateTime(data.current_version.updated_at)}</small>
                    </div>
                </div>
            </div>
            <h6 class="mb-3">Versioni Precedenti</h6>
        `;
        
        if (data.versions.length === 0) {
            html += '<div class="alert alert-info">Nessuna versione precedente disponibile.</div>';
        } else {
            html += '<div class="list-group">';
            data.versions.forEach(version => {
                const date = formatDateTime(version.created_at);
                html += `
                    <div class="list-group-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <h6 class="mb-1">Versione ${version.version_number}: ${version.title}</h6>
                                <small class="text-muted">${date}</small>
                                ${version.comment ? `<p class="mb-1 mt-2"><small><em>${version.comment}</em></small></p>` : ''}
                            </div>
                            <div class="btn-group" role="group">
                                <button class="btn btn-sm btn-outline-primary" onclick="viewVersion(${courseId}, ${lessonId}, ${version.id})" title="Visualizza">
                                    <i class="bi bi-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-info" onclick="compareVersions(${courseId}, ${lessonId}, ${version.id}, 'current')" title="Confronta con corrente">
                                    <i class="bi bi-arrow-left-right"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-success" onclick="restoreVersion(${courseId}, ${lessonId}, ${version.id}, '${version.title.replace(/'/g, "\\'")}')" title="Ripristina">
                                    <i class="bi bi-arrow-counterclockwise"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        content.innerHTML = html;
    } catch (error) {
        console.error('Errore:', error);
        content.innerHTML = `<div class="alert alert-danger">Errore nel caricamento delle versioni: ${error.message}</div>`;
    }
}

async function viewVersion(courseId, lessonId, versionId) {
    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonId}/versions/${versionId}`);
        if (!response.ok) throw new Error('Errore nel caricamento della versione');
        
        const version = await response.json();
        
        // Usa il modal delle versioni per visualizzare i dettagli
        const modal = new bootstrap.Modal(document.getElementById('versionHistoryModal'));
        const content = document.getElementById('versionHistoryContent');
        
        if (!content) {
            throw new Error('Elemento versionHistoryContent non trovato');
        }
        
        let html = `
            <div class="mb-3">
                <button class="btn btn-sm btn-outline-secondary mb-3" onclick="showVersionHistory(${courseId}, ${lessonId})">
                    <i class="bi bi-arrow-left"></i> Torna alla Cronologia
                </button>
            </div>
            <div class="card">
                <div class="card-header">
                    <h5>Versione ${version.version_number}: ${version.title}</h5>
                    <small class="text-muted">${formatDateTime(version.created_at)}</small>
                </div>
                <div class="card-body">
                    ${version.comment ? `<div class="alert alert-info mb-3"><strong>Commento:</strong> ${version.comment}</div>` : ''}
                    <div class="mb-3">
                        <strong>Descrizione:</strong>
                        <p>${version.description || '<em>Nessuna descrizione</em>'}</p>
                    </div>
                    <div class="mb-3">
                        <strong>Contenuti:</strong>
                        <div class="markdown-preview border p-3 rounded" style="max-height: 400px; overflow-y: auto;">${version.content ? marked.parse(version.content) : '<em>Nessun contenuto</em>'}</div>
                    </div>
                    <div class="mb-3">
                        <strong>Obiettivi:</strong>
                        <ul>${version.objectives.length > 0 ? version.objectives.map(obj => `<li>${obj}</li>`).join('') : '<li><em>Nessun obiettivo</em></li>'}</ul>
                    </div>
                    <div class="mb-3">
                        <strong>Materiali:</strong>
                        <ul>${version.materials.length > 0 ? version.materials.map(mat => `<li>${mat}</li>`).join('') : '<li><em>Nessun materiale</em></li>'}</ul>
                    </div>
                    <div class="mb-3">
                        <strong>Esercizi:</strong>
                        <ul>${version.exercises.length > 0 ? version.exercises.map(ex => `<li>${ex}</li>`).join('') : '<li><em>Nessun esercizio</em></li>'}</ul>
                    </div>
                </div>
            </div>
        `;
        
        content.innerHTML = html;
        modal.show();
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nel caricamento della versione: ' + error.message);
    }
}

async function compareVersions(courseId, lessonId, version1Id, version2Id) {
    try {
        const url = `${API_BASE}/courses/${courseId}/lessons/${lessonId}/versions/compare?version1=${version1Id}&version2=${version2Id}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Errore nel confronto delle versioni');
        
        const data = await response.json();
        
        const modal = new bootstrap.Modal(document.getElementById('versionCompareModal'));
        document.getElementById('compareVersion1Title').textContent = `Versione ${data.version1.version_number}: ${data.version1.title}`;
        document.getElementById('compareVersion2Title').textContent = `${data.version2.version_number === 'current' ? 'Versione Corrente' : 'Versione ' + data.version2.version_number}: ${data.version2.title}`;
        
        const v1Content = document.getElementById('compareVersion1Content');
        const v2Content = document.getElementById('compareVersion2Content');
        
        v1Content.innerHTML = `
            <div class="mb-3">
                <strong>Descrizione:</strong>
                <p>${data.version1.description || '<em>Nessuna descrizione</em>'}</p>
            </div>
            <div class="mb-3">
                <strong>Contenuti:</strong>
                <div class="markdown-preview">${data.version1.content ? marked.parse(data.version1.content) : '<em>Nessun contenuto</em>'}</div>
            </div>
            <div class="mb-3">
                <strong>Obiettivi:</strong>
                <ul>${data.version1.objectives.length > 0 ? data.version1.objectives.map(obj => `<li>${obj}</li>`).join('') : '<li><em>Nessun obiettivo</em></li>'}</ul>
            </div>
            <div class="mb-3">
                <strong>Materiali:</strong>
                <ul>${data.version1.materials.length > 0 ? data.version1.materials.map(mat => `<li>${mat}</li>`).join('') : '<li><em>Nessun materiale</em></li>'}</ul>
            </div>
            <div class="mb-3">
                <strong>Esercizi:</strong>
                <ul>${data.version1.exercises.length > 0 ? data.version1.exercises.map(ex => `<li>${ex}</li>`).join('') : '<li><em>Nessun esercizio</em></li>'}</ul>
            </div>
        `;
        
        v2Content.innerHTML = `
            <div class="mb-3">
                <strong>Descrizione:</strong>
                <p>${data.version2.description || '<em>Nessuna descrizione</em>'}</p>
            </div>
            <div class="mb-3">
                <strong>Contenuti:</strong>
                <div class="markdown-preview">${data.version2.content ? marked.parse(data.version2.content) : '<em>Nessun contenuto</em>'}</div>
            </div>
            <div class="mb-3">
                <strong>Obiettivi:</strong>
                <ul>${data.version2.objectives.length > 0 ? data.version2.objectives.map(obj => `<li>${obj}</li>`).join('') : '<li><em>Nessun obiettivo</em></li>'}</ul>
            </div>
            <div class="mb-3">
                <strong>Materiali:</strong>
                <ul>${data.version2.materials.length > 0 ? data.version2.materials.map(mat => `<li>${mat}</li>`).join('') : '<li><em>Nessun materiale</em></li>'}</ul>
            </div>
            <div class="mb-3">
                <strong>Esercizi:</strong>
                <ul>${data.version2.exercises.length > 0 ? data.version2.exercises.map(ex => `<li>${ex}</li>`).join('') : '<li><em>Nessun esercizio</em></li>'}</ul>
            </div>
        `;
        
        modal.show();
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nel confronto delle versioni: ' + error.message);
    }
}

async function restoreVersion(courseId, lessonId, versionId, versionTitle) {
    if (!confirm(`Sei sicuro di voler ripristinare la versione "${versionTitle}"?\n\nLa versione corrente verrà salvata automaticamente come backup.`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonId}/versions/${versionId}/restore`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Errore nel ripristino');
        }
        
        const result = await response.json();
        showToast(result.message, 'success');
        
        // Chiudi il modal delle versioni
        const versionModal = bootstrap.Modal.getInstance(document.getElementById('versionHistoryModal'));
        if (versionModal) versionModal.hide();
        
        // Ricarica le lezioni per mostrare la versione ripristinata
        if (currentCourseId) {
            await openLessonsModal(currentCourseId);
        }
    } catch (error) {
        console.error('Errore:', error);
        showToast('Errore nel ripristino della versione: ' + error.message, 'error');
    }
}

// ==================== FUNZIONI COLLABORAZIONE ====================

let currentCollaborationLessonId = null;
let currentCollaborationCourseId = null;

async function showCollaborationModal(courseId, lessonId) {
    currentCollaborationCourseId = courseId;
    currentCollaborationLessonId = lessonId;
    
    const modal = new bootstrap.Modal(document.getElementById('collaborationModal'));
    modal.show();
    
    // Carica contenuti iniziali
    await loadNotes(courseId, lessonId);
    await loadComments(courseId, lessonId);
    await loadReminders(courseId, lessonId);
    
    // Ascolta cambio tab
    document.getElementById('collabTabs').addEventListener('shown.bs.tab', function(event) {
        const targetTab = event.target.getAttribute('data-bs-target');
        if (targetTab === '#notes') {
            loadNotes(courseId, lessonId);
        } else if (targetTab === '#comments') {
            loadComments(courseId, lessonId);
        } else if (targetTab === '#reminders') {
            loadReminders(courseId, lessonId);
        }
    });
}

async function loadNotes(courseId, lessonId) {
    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonId}/notes`);
        if (!response.ok) throw new Error('Errore nel caricamento delle note');
        
        const notes = await response.json();
        const container = document.getElementById('notesList');
        
        if (notes.length === 0) {
            container.innerHTML = '<div class="alert alert-info">Nessuna nota disponibile.</div>';
            return;
        }
        
        container.innerHTML = notes.map(note => {
            const date = formatDateTime(note.created_at);
            const updated = note.updated_at && note.updated_at !== note.created_at 
                ? ` (modificata: ${formatDateTime(note.updated_at)})` : '';
            return `
                <div class="card mb-2">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <p class="mb-1">${note.content}</p>
                                <small class="text-muted">
                                    ${note.is_private ? '<i class="bi bi-lock"></i> Privata' : '<i class="bi bi-unlock"></i> Pubblica'} • 
                                    ${note.created_by || 'Utente'} • ${date}${updated}
                                </small>
                            </div>
                            <div class="btn-group" role="group">
                                <button class="btn btn-sm btn-outline-primary" onclick="editNote(${courseId}, ${lessonId}, ${note.id}, '${note.content.replace(/'/g, "\\'")}')">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteNote(${courseId}, ${lessonId}, ${note.id})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Errore:', error);
        document.getElementById('notesList').innerHTML = `<div class="alert alert-danger">Errore: ${error.message}</div>`;
    }
}

function showAddNoteForm() {
    document.getElementById('addNoteForm').style.display = 'block';
    document.getElementById('newNoteContent').focus();
}

function cancelAddNote() {
    document.getElementById('addNoteForm').style.display = 'none';
    document.getElementById('newNoteContent').value = '';
    document.getElementById('newNotePrivate').checked = true;
}

async function saveNote() {
    const content = document.getElementById('newNoteContent').value.trim();
    if (!content) {
        alert('Inserisci il contenuto della nota');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/courses/${currentCollaborationCourseId}/lessons/${currentCollaborationLessonId}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: content,
                is_private: document.getElementById('newNotePrivate').checked,
                created_by: 'Utente'
            })
        });
        
        if (!response.ok) throw new Error('Errore nel salvataggio');
        
        showToast('Nota creata con successo', 'success');
        cancelAddNote();
        await loadNotes(currentCollaborationCourseId, currentCollaborationLessonId);
        await checkNotifications(); // Aggiorna notifiche
    } catch (error) {
        console.error('Errore:', error);
        showToast('Errore: ' + error.message, 'error');
    }
}

async function editNote(courseId, lessonId, noteId, currentContent) {
    const newContent = prompt('Modifica nota:', currentContent);
    if (!newContent || newContent === currentContent) return;
    
    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonId}/notes/${noteId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: newContent })
        });
        
        if (!response.ok) throw new Error('Errore nell\'aggiornamento');
        
        showToast('Nota aggiornata', 'success');
        await loadNotes(courseId, lessonId);
    } catch (error) {
        console.error('Errore:', error);
        showToast('Errore: ' + error.message, 'error');
    }
}

async function deleteNote(courseId, lessonId, noteId) {
    if (!confirm('Eliminare questa nota?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonId}/notes/${noteId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Errore nell\'eliminazione');
        
        showToast('Nota eliminata', 'success');
        await loadNotes(courseId, lessonId);
    } catch (error) {
        console.error('Errore:', error);
        showToast('Errore: ' + error.message, 'error');
    }
}

async function loadComments(courseId, lessonId) {
    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonId}/comments`);
        if (!response.ok) throw new Error('Errore nel caricamento dei commenti');
        
        const comments = await response.json();
        const container = document.getElementById('commentsList');
        
        if (comments.length === 0) {
            container.innerHTML = '<div class="alert alert-info">Nessun commento. Inizia la conversazione!</div>';
            return;
        }
        
        function renderComment(comment, level = 0) {
            const date = formatDateTime(comment.created_at);
            const margin = level > 0 ? `ms-${level * 3}` : '';
            const safeAuthor = (comment.author || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
            let html = `
                <div class="card mb-2 ${margin}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <strong>${comment.author}</strong>
                                <small class="text-muted ms-2">${date}</small>
                                <p class="mb-1 mt-2">${comment.content}</p>
                            </div>
                            <div class="btn-group" role="group">
                                <button class="btn btn-sm btn-outline-secondary reply-comment-btn" 
                                        data-comment-id="${comment.id}" 
                                        data-comment-author="${safeAuthor}">
                                    <i class="bi bi-reply"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger delete-comment-btn" 
                                        data-course-id="${courseId}" 
                                        data-lesson-id="${lessonId}" 
                                        data-comment-id="${comment.id}">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            if (comment.replies && comment.replies.length > 0) {
                html += comment.replies.map(reply => renderComment(reply, level + 1)).join('');
            }
            
            return html;
        }
        
        container.innerHTML = comments.map(c => renderComment(c)).join('');
        
        // Aggiungi event listeners per i pulsanti
        container.querySelectorAll('.reply-comment-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const commentId = parseInt(this.getAttribute('data-comment-id'));
                const authorName = this.getAttribute('data-comment-author');
                replyToComment(commentId, authorName);
            });
        });
        
        container.querySelectorAll('.delete-comment-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const courseId = parseInt(this.getAttribute('data-course-id'));
                const lessonId = parseInt(this.getAttribute('data-lesson-id'));
                const commentId = parseInt(this.getAttribute('data-comment-id'));
                deleteComment(courseId, lessonId, commentId);
            });
        });
        
        // Aggiungi form risposta se necessario
        if (document.getElementById('replyForm')) {
            document.getElementById('replyForm').remove();
        }
    } catch (error) {
        console.error('Errore:', error);
        container.innerHTML = `<div class="alert alert-danger">Errore: ${error.message}</div>`;
    }
}

function replyToComment(parentId, authorName) {
    const replyForm = document.createElement('div');
    replyForm.id = 'replyForm';
    replyForm.className = 'card mb-2 ms-3';
    replyForm.innerHTML = `
        <div class="card-body">
            <h6>Rispondi a ${authorName}</h6>
            <input type="text" class="form-control mb-2" id="replyAuthor" placeholder="Il tuo nome" value="Utente">
            <textarea class="form-control mb-2" id="replyContent" rows="2" placeholder="Scrivi una risposta..."></textarea>
            <div class="d-flex gap-2">
                <button class="btn btn-sm btn-primary" onclick="saveReply(${currentCollaborationCourseId}, ${currentCollaborationLessonId}, ${parentId})">Invia</button>
                <button class="btn btn-sm btn-secondary" onclick="document.getElementById('replyForm').remove()">Annulla</button>
            </div>
        </div>
    `;
    
    const commentsList = document.getElementById('commentsList');
    commentsList.appendChild(replyForm);
    document.getElementById('replyContent').focus();
}

async function saveComment() {
    const content = document.getElementById('newCommentContent').value.trim();
    const author = document.getElementById('commentAuthor').value.trim() || 'Utente';
    
    if (!content) {
        alert('Inserisci un commento');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/courses/${currentCollaborationCourseId}/lessons/${currentCollaborationLessonId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, author })
        });
        
        if (!response.ok) throw new Error('Errore nel salvataggio');
        
        showToast('Commento pubblicato', 'success');
        document.getElementById('newCommentContent').value = '';
        await loadComments(currentCollaborationCourseId, currentCollaborationLessonId);
        await checkNotifications();
    } catch (error) {
        console.error('Errore:', error);
        showToast('Errore: ' + error.message, 'error');
    }
}

async function saveReply(courseId, lessonId, parentId) {
    const content = document.getElementById('replyContent').value.trim();
    const author = document.getElementById('replyAuthor').value.trim() || 'Utente';
    
    if (!content) {
        alert('Inserisci una risposta');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, author, parent_id: parentId })
        });
        
        if (!response.ok) throw new Error('Errore nel salvataggio');
        
        showToast('Risposta pubblicata', 'success');
        document.getElementById('replyForm').remove();
        await loadComments(courseId, lessonId);
        await checkNotifications();
    } catch (error) {
        console.error('Errore:', error);
        showToast('Errore: ' + error.message, 'error');
    }
}

async function deleteComment(courseId, lessonId, commentId) {
    if (!confirm('Eliminare questo commento?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonId}/comments/${commentId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Errore nell\'eliminazione');
        
        showToast('Commento eliminato', 'success');
        await loadComments(courseId, lessonId);
    } catch (error) {
        console.error('Errore:', error);
        showToast('Errore: ' + error.message, 'error');
    }
}

async function loadReminders(courseId, lessonId) {
    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonId}/reminders`);
        if (!response.ok) throw new Error('Errore nel caricamento dei promemoria');
        
        const reminders = await response.json();
        const container = document.getElementById('remindersList');
        
        if (reminders.length === 0) {
            container.innerHTML = '<div class="alert alert-info">Nessun promemoria.</div>';
            return;
        }
        
        container.innerHTML = reminders.map(reminder => {
            const date = formatDateTime(reminder.reminder_date);
            const isPast = reminder.reminder_date ? new Date(reminder.reminder_date) < new Date() : false;
            const completedClass = reminder.is_completed ? 'text-decoration-line-through text-muted' : '';
            const pastClass = isPast && !reminder.is_completed ? 'border-warning' : '';
            
            return `
                <div class="card mb-2 ${pastClass}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <div class="form-check">
                                    <input class="form-check-input toggle-reminder-checkbox" 
                                           type="checkbox" 
                                           ${reminder.is_completed ? 'checked' : ''} 
                                           data-course-id="${courseId}" 
                                           data-lesson-id="${lessonId}" 
                                           data-reminder-id="${reminder.id}">
                                    <label class="form-check-label ${completedClass}">
                                        <strong>${reminder.title}</strong>
                                    </label>
                                </div>
                                ${reminder.description ? `<p class="mb-1 mt-2 ${completedClass}">${reminder.description}</p>` : ''}
                                <small class="text-muted">
                                    <i class="bi bi-calendar"></i> ${date} • ${reminder.created_by || 'Utente'}
                                    ${isPast && !reminder.is_completed ? ' <span class="badge bg-warning">Scaduto</span>' : ''}
                                </small>
                            </div>
                            <button class="btn btn-sm btn-outline-danger delete-reminder-btn" 
                                    data-course-id="${courseId}" 
                                    data-lesson-id="${lessonId}" 
                                    data-reminder-id="${reminder.id}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Aggiungi event listeners per i checkbox e i pulsanti
        container.querySelectorAll('.toggle-reminder-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const courseId = parseInt(this.getAttribute('data-course-id'));
                const lessonId = parseInt(this.getAttribute('data-lesson-id'));
                const reminderId = parseInt(this.getAttribute('data-reminder-id'));
                const isChecked = this.checked;
                toggleReminder(courseId, lessonId, reminderId, isChecked);
            });
        });
        
        container.querySelectorAll('.delete-reminder-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const courseId = parseInt(this.getAttribute('data-course-id'));
                const lessonId = parseInt(this.getAttribute('data-lesson-id'));
                const reminderId = parseInt(this.getAttribute('data-reminder-id'));
                deleteReminder(courseId, lessonId, reminderId);
            });
        });
    } catch (error) {
        console.error('Errore:', error);
        container.innerHTML = `<div class="alert alert-danger">Errore: ${error.message}</div>`;
    }
}

function showAddReminderForm() {
    document.getElementById('addReminderForm').style.display = 'block';
    // Imposta data di default a domani
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('newReminderDate').value = tomorrow.toISOString().slice(0, 16);
    document.getElementById('newReminderTitle').focus();
}

function cancelAddReminder() {
    document.getElementById('addReminderForm').style.display = 'none';
    document.getElementById('newReminderTitle').value = '';
    document.getElementById('newReminderDescription').value = '';
}

async function saveReminder() {
    const title = document.getElementById('newReminderTitle').value.trim();
    const description = document.getElementById('newReminderDescription').value.trim();
    const date = document.getElementById('newReminderDate').value;
    
    if (!title || !date) {
        alert('Inserisci titolo e data');
        return;
    }
    
    try {
        const reminderDate = new Date(date).toISOString();
        const response = await fetch(`${API_BASE}/courses/${currentCollaborationCourseId}/lessons/${currentCollaborationLessonId}/reminders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title,
                description: description,
                reminder_date: reminderDate,
                created_by: 'Utente'
            })
        });
        
        if (!response.ok) throw new Error('Errore nel salvataggio');
        
        showToast('Promemoria creato', 'success');
        cancelAddReminder();
        await loadReminders(currentCollaborationCourseId, currentCollaborationLessonId);
        await checkNotifications();
    } catch (error) {
        console.error('Errore:', error);
        showToast('Errore: ' + error.message, 'error');
    }
}

async function toggleReminder(courseId, lessonId, reminderId, isCompleted) {
    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonId}/reminders/${reminderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_completed: isCompleted })
        });
        
        if (!response.ok) throw new Error('Errore nell\'aggiornamento');
        
        await loadReminders(courseId, lessonId);
    } catch (error) {
        console.error('Errore:', error);
        showToast('Errore: ' + error.message, 'error');
    }
}

async function deleteReminder(courseId, lessonId, reminderId) {
    if (!confirm('Eliminare questo promemoria?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonId}/reminders/${reminderId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Errore nell\'eliminazione');
        
        showToast('Promemoria eliminato', 'success');
        await loadReminders(courseId, lessonId);
    } catch (error) {
        console.error('Errore:', error);
        showToast('Errore: ' + error.message, 'error');
    }
}

async function showNotificationsModal() {
    const modal = new bootstrap.Modal(document.getElementById('notificationsModal'));
    modal.show();
    await loadNotifications();
}

async function loadNotifications() {
    try {
        const response = await fetch(`${API_BASE}/notifications?unread_only=false`);
        if (!response.ok) throw new Error('Errore nel caricamento');
        
        const notifications = await response.json();
        const container = document.getElementById('notificationsList');
        const countEl = document.getElementById('notificationsCount');
        
        const unreadCount = notifications.filter(n => !n.is_read).length;
        countEl.textContent = `${notifications.length} notifiche (${unreadCount} non lette)`;
        
        if (notifications.length === 0) {
            container.innerHTML = '<div class="alert alert-info">Nessuna notifica.</div>';
            return;
        }
        
        container.innerHTML = notifications.map(notif => {
            const date = formatDateTime(notif.created_at);
            const readClass = notif.is_read ? '' : 'border-primary';
            const iconClass = {
                'comment': 'bi-chat-left-text',
                'reminder': 'bi-bell',
                'note': 'bi-sticky',
                'version': 'bi-clock-history'
            }[notif.type] || 'bi-info-circle';
            
            // Crea link alla lezione/corso se disponibile
            let linkHtml = '';
            if (notif.lesson_id && notif.course_id) {
                const safeType = (notif.type || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                linkHtml = `
                    <a href="#" class="btn btn-sm btn-outline-info me-2 go-to-notification-btn" 
                       data-course-id="${notif.course_id}" 
                       data-lesson-id="${notif.lesson_id}" 
                       data-notification-type="${safeType}">
                        <i class="bi bi-arrow-right-circle"></i> Vai alla Lezione
                    </a>
                `;
            } else if (notif.course_id) {
                linkHtml = `
                    <a href="#" class="btn btn-sm btn-outline-info me-2 go-to-course-btn" 
                       data-course-id="${notif.course_id}">
                        <i class="bi bi-arrow-right-circle"></i> Vai al Corso
                    </a>
                `;
            }
            
            return `
                <div class="card mb-2 ${readClass}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <h6 class="mb-1">
                                    <i class="bi ${iconClass}"></i> ${notif.title}
                                </h6>
                                <p class="mb-1">${notif.message}</p>
                                <small class="text-muted">${date}</small>
                                ${linkHtml}
                            </div>
                            <div class="btn-group" role="group">
                                ${!notif.is_read ? `
                                    <button class="btn btn-sm btn-outline-primary mark-notification-read-btn" 
                                            data-notification-id="${notif.id}" 
                                            title="Segna come letta">
                                        <i class="bi bi-check"></i>
                                    </button>
                                ` : ''}
                                <button class="btn btn-sm btn-outline-danger delete-notification-btn" 
                                        data-notification-id="${notif.id}" 
                                        title="Elimina">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Aggiungi event listeners per i pulsanti delle notifiche
        container.querySelectorAll('.go-to-notification-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                // Rimuovi il focus prima di chiudere il modal
                this.blur();
                const courseId = parseInt(this.getAttribute('data-course-id'));
                const lessonId = parseInt(this.getAttribute('data-lesson-id'));
                const notificationType = this.getAttribute('data-notification-type');
                // Usa setTimeout per assicurarsi che blur() sia completato
                setTimeout(() => {
                    goToNotification(courseId, lessonId, notificationType);
                }, 10);
            });
        });
        
        container.querySelectorAll('.go-to-course-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                // Rimuovi il focus prima di chiudere il modal
                this.blur();
                const courseId = parseInt(this.getAttribute('data-course-id'));
                // Usa setTimeout per assicurarsi che blur() sia completato
                setTimeout(() => {
                    goToCourse(courseId);
                }, 10);
            });
        });
        
        container.querySelectorAll('.mark-notification-read-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const notificationId = parseInt(this.getAttribute('data-notification-id'));
                markNotificationRead(notificationId);
            });
        });
        
        container.querySelectorAll('.delete-notification-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const notificationId = parseInt(this.getAttribute('data-notification-id'));
                deleteNotification(notificationId);
            });
        });
    } catch (error) {
        console.error('Errore:', error);
        document.getElementById('notificationsList').innerHTML = `<div class="alert alert-danger">Errore: ${error.message}</div>`;
    }
}

async function markNotificationRead(notificationId) {
    try {
        const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
            method: 'PUT'
        });
        
        if (!response.ok) throw new Error('Errore');
        
        await loadNotifications();
        await checkNotifications(); // Aggiorna badge
    } catch (error) {
        console.error('Errore:', error);
    }
}

async function markAllNotificationsRead() {
    try {
        const response = await fetch(`${API_BASE}/notifications/read-all`, {
            method: 'PUT'
        });
        
        if (!response.ok) throw new Error('Errore');
        
        showToast('Tutte le notifiche segnate come lette', 'success');
        await loadNotifications();
        await checkNotifications();
    } catch (error) {
        console.error('Errore:', error);
        showToast('Errore: ' + error.message, 'error');
    }
}

async function deleteNotification(notificationId) {
    if (!confirm('Eliminare questa notifica?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Errore nell\'eliminazione');
        
        showToast('Notifica eliminata', 'success');
        await loadNotifications();
        await checkNotifications(); // Aggiorna badge
    } catch (error) {
        console.error('Errore:', error);
        showToast('Errore: ' + error.message, 'error');
    }
}

function goToNotification(courseId, lessonId, notificationType) {
    // Chiudi il modal delle notifiche rimuovendo prima il focus
    const notificationsModalEl = document.getElementById('notificationsModal');
    const notificationsModal = bootstrap.Modal.getInstance(notificationsModalEl);
    if (notificationsModal) {
        // Assicurati che non ci sia focus attivo
        const activeElement = document.activeElement;
        if (activeElement && notificationsModalEl.contains(activeElement)) {
            activeElement.blur();
        }
        notificationsModal.hide();
    }
    
    // Apri il modal delle lezioni
    openLessonsModal(courseId).then(() => {
        // Se la notifica è relativa a collaborazione, apri anche il modal collaborazione
        if (notificationType === 'comment' || notificationType === 'note' || notificationType === 'reminder') {
            setTimeout(() => {
                showCollaborationModal(courseId, lessonId);
                // Cambia al tab appropriato
                setTimeout(() => {
                    if (notificationType === 'comment') {
                        document.getElementById('comments-tab').click();
                    } else if (notificationType === 'note') {
                        document.getElementById('notes-tab').click();
                    } else if (notificationType === 'reminder') {
                        document.getElementById('reminders-tab').click();
                    }
                }, 300);
            }, 500);
        }
    });
}

function goToCourse(courseId) {
    // Chiudi il modal delle notifiche rimuovendo prima il focus
    const notificationsModalEl = document.getElementById('notificationsModal');
    const notificationsModal = bootstrap.Modal.getInstance(notificationsModalEl);
    if (notificationsModal) {
        // Assicurati che non ci sia focus attivo
        const activeElement = document.activeElement;
        if (activeElement && notificationsModalEl.contains(activeElement)) {
            activeElement.blur();
        }
        notificationsModal.hide();
    }
    
    // Mostra i corsi (la funzione showCourses() dovrebbe già esistere)
    showCourses();
}

async function checkNotifications() {
    try {
        const response = await fetch(`${API_BASE}/notifications?unread_only=true`);
        if (!response.ok) return;
        
        const notifications = await response.json();
        const badge = document.getElementById('notificationsBadge');
        
        if (notifications.length > 0) {
            badge.textContent = notifications.length;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    } catch (error) {
        console.error('Errore nel controllo notifiche:', error);
    }
}

// Controlla notifiche ogni 30 secondi
setInterval(checkNotifications, 30000);

function setupHoursRecalculation() {
    // Funzione per ricalcolare le ore totali
    function recalculateTotalHours() {
        const theoryHours = parseFloat(document.getElementById('theoryHours')?.value) || 0;
        const practiceHours = parseFloat(document.getElementById('practiceHours')?.value) || 0;
        const totalHours = theoryHours + practiceHours;
        
        const totalHoursInput = document.getElementById('totalHours');
        if (totalHoursInput) {
            totalHoursInput.value = totalHours || '';
        }
    }
    
    // Aggiungi event listener quando il modal viene mostrato
    const courseModal = document.getElementById('courseModal');
    if (courseModal) {
        courseModal.addEventListener('shown.bs.modal', function() {
            const theoryHoursInput = document.getElementById('theoryHours');
            const practiceHoursInput = document.getElementById('practiceHours');
            
            if (theoryHoursInput) {
                theoryHoursInput.removeEventListener('input', recalculateTotalHours);
                theoryHoursInput.addEventListener('input', recalculateTotalHours);
                theoryHoursInput.addEventListener('change', recalculateTotalHours);
            }
            
            if (practiceHoursInput) {
                practiceHoursInput.removeEventListener('input', recalculateTotalHours);
                practiceHoursInput.addEventListener('input', recalculateTotalHours);
                practiceHoursInput.addEventListener('change', recalculateTotalHours);
            }
            
            // Ricalcola all'apertura del modal
            recalculateTotalHours();
        });
    }
}

async function showLessonForm() {
    // Reset form
    document.getElementById('lessonForm').reset();
    document.getElementById('lessonId').value = '';
    document.querySelector('#lessonFormContainer h6').textContent = 'Nuova Lezione';
    
    // Calcola il prossimo ordine disponibile
    try {
        const response = await fetch(`${API_BASE}/courses/${currentCourseId}`);
        const course = await response.json();
        const maxOrder = course.lessons && course.lessons.length > 0
            ? Math.max(...course.lessons.map(l => l.order || 0))
            : 0;
        document.getElementById('lessonOrder').value = maxOrder + 1;
    } catch (error) {
        console.error('Errore nel calcolo ordine:', error);
        document.getElementById('lessonOrder').value = 1;
    }
    
    // Applica preferenze predefinite se disponibili
    if (Object.keys(appPreferences).length === 0) {
        await loadPreferences();
    }
    if (appPreferences.defaultLessonDuration) {
        document.getElementById('lessonDuration').value = appPreferences.defaultLessonDuration;
    }
    if (appPreferences.defaultLessonType) {
        document.getElementById('lessonType').value = appPreferences.defaultLessonType;
    }
    
    // Inizializza o reinizializza il datepicker
    initLessonDatePicker();
    
    // Mostra il form e scrolla verso di esso
    document.getElementById('lessonFormContainer').style.display = 'block';
    setTimeout(() => {
        document.getElementById('lessonFormContainer').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

function initLessonDatePicker() {
    const dateInput = document.getElementById('lessonDate');
    if (!dateInput) {
        console.error('Elemento lessonDate non trovato!');
        return;
    }
    
    // Distruggi il datepicker esistente se presente
    if (lessonDatePicker) {
        lessonDatePicker.destroy();
        lessonDatePicker = null;
    }
    
    // Inizializza Flatpickr
    try {
        lessonDatePicker = flatpickr(dateInput, {
            dateFormat: 'Y-m-d',
            locale: 'it',
            allowInput: true,
            clickOpens: true,
            defaultDate: null
        });
    } catch (error) {
        console.error('Errore nell\'inizializzazione del datepicker:', error);
    }
}

function cancelLessonForm() {
    document.getElementById('lessonFormContainer').style.display = 'none';
    document.getElementById('lessonForm').reset();
    // Reset del datepicker
    if (lessonDatePicker) {
        lessonDatePicker.clear();
    }
}

async function saveLesson() {
    if (!currentCourseId) return;

    const objectives = document.getElementById('lessonObjectives').value.split('\n').filter(o => o.trim());
    const materials = document.getElementById('lessonMaterials').value.split('\n').filter(m => m.trim());
    const exercises = document.getElementById('lessonExercises').value.split('\n').filter(e => e.trim());

    // Recupera la data dal datepicker se presente
    let lessonDate = null;
    const dateInput = document.getElementById('lessonDate');
    
    if (lessonDatePicker && lessonDatePicker.selectedDates && lessonDatePicker.selectedDates.length > 0) {
        const selectedDate = lessonDatePicker.selectedDates[0];
        // Formatta la data come YYYY-MM-DD senza problemi di timezone
        // Usa i metodi locali invece di toISOString() per evitare problemi di timezone
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        lessonDate = `${year}-${month}-${day}`;
    } else if (dateInput && dateInput.value) {
        // Fallback: usa il valore dell'input se il datepicker non è inizializzato
        lessonDate = dateInput.value;
    }

    const lessonData = {
        title: document.getElementById('lessonTitle').value,
        description: document.getElementById('lessonDescription').value,
        lesson_type: document.getElementById('lessonType').value,
        duration_hours: parseFloat(document.getElementById('lessonDuration').value),
        order: parseInt(document.getElementById('lessonOrder').value),
        content: document.getElementById('lessonContent').value,
        objectives: objectives,
        materials: materials,
        exercises: exercises,
        lesson_date: lessonDate || null
    };

    const lessonId = document.getElementById('lessonId').value;
    const url = lessonId 
        ? `${API_BASE}/courses/${currentCourseId}/lessons/${lessonId}`
        : `${API_BASE}/courses/${currentCourseId}/lessons`;
    const method = lessonId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lessonData)
        });

        if (response.ok) {
            cancelLessonForm();
            openLessonsModal(currentCourseId);
            alert('Lezione salvata con successo!');
        } else {
            alert('Errore nel salvataggio della lezione');
        }
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nella comunicazione con il server');
    }
}

async function editLesson(lessonId) {
    try {
        const response = await fetch(`${API_BASE}/courses/${currentCourseId}`);
        const course = await response.json();
        const lesson = course.lessons.find(l => l.id === lessonId);
        
        if (!lesson) return;

        document.getElementById('lessonId').value = lesson.id;
        document.getElementById('lessonTitle').value = lesson.title;
        document.getElementById('lessonDescription').value = lesson.description || '';
        document.getElementById('lessonType').value = lesson.lesson_type;
        document.getElementById('lessonDuration').value = lesson.duration_hours;
        document.getElementById('lessonOrder').value = lesson.order;
        document.getElementById('lessonContent').value = lesson.content || '';
        document.getElementById('lessonObjectives').value = (lesson.objectives || []).join('\n');
        document.getElementById('lessonMaterials').value = (lesson.materials || []).join('\n');
        document.getElementById('lessonExercises').value = (lesson.exercises || []).join('\n');
        
        // Inizializza il datepicker e imposta la data se presente
        initLessonDatePicker();
        if (lesson.lesson_date) {
            // Assicurati che la data sia nel formato corretto per Flatpickr
            let dateToSet = lesson.lesson_date;
            // Se è una stringa ISO con time, prendi solo la parte data
            if (typeof dateToSet === 'string' && dateToSet.includes('T')) {
                dateToSet = dateToSet.split('T')[0];
            }
            lessonDatePicker.setDate(dateToSet, false); // false = non triggerare eventi
        } else {
            lessonDatePicker.clear();
        }
        
        document.querySelector('#lessonFormContainer h6').textContent = 'Modifica Lezione';
        document.getElementById('lessonFormContainer').style.display = 'block';
        setTimeout(() => {
            document.getElementById('lessonFormContainer').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nel caricamento della lezione');
    }
}

async function expandLessonWithChatGPT(lessonId, lessonTitle, buttonElement) {
    if (!confirm(`Vuoi espandere e dettagliare la lezione "${lessonTitle}" usando ChatGPT?\n\nQuesta operazione aggiungerà contenuto dettagliato alla lezione basandosi sul contenuto esistente.`)) {
        return;
    }
    
    // Mostra un indicatore di caricamento
    const button = buttonElement;
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="bi bi-hourglass-split"></i> Elaborazione...';
    
    try {
        const response = await fetch(`${API_BASE}/courses/${currentCourseId}/lessons/${lessonId}/expand`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Ricarica le lezioni per vedere il contenuto aggiornato
            openLessonsModal(currentCourseId);
            alert('Lezione espansa con successo! Il contenuto dettagliato è stato aggiunto.');
        } else {
            alert(`Errore nell'espansione: ${result.error || 'Errore sconosciuto'}`);
        }
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nella comunicazione con il server');
    } finally {
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

async function generateObjectives() {
    if (!currentCourseId) {
        alert('Nessun corso selezionato');
        return;
    }
    
    const title = document.getElementById('lessonTitle').value.trim();
    if (!title) {
        alert('Inserisci prima il titolo della lezione');
        document.getElementById('lessonTitle').focus();
        return;
    }
    
    const button = document.getElementById('generateObjectivesBtn');
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="bi bi-hourglass-split"></i> Generazione...';
    
    try {
        const lessonData = {
            title: title,
            description: document.getElementById('lessonDescription').value.trim(),
            lesson_type: document.getElementById('lessonType').value,
            duration_hours: parseFloat(document.getElementById('lessonDuration').value) || 2
        };
        
        const response = await fetch(`${API_BASE}/courses/${currentCourseId}/lessons/generate-objectives`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lessonData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Aggiungi gli obiettivi generati al campo (sostituisci o aggiungi)
            const currentObjectives = document.getElementById('lessonObjectives').value.trim();
            const newObjectives = result.objectives_text;
            
            if (currentObjectives) {
                document.getElementById('lessonObjectives').value = currentObjectives + '\n' + newObjectives;
            } else {
                document.getElementById('lessonObjectives').value = newObjectives;
            }
            
            // Mostra un toast o messaggio di successo
            const toast = document.createElement('div');
            toast.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
            toast.style.zIndex = '9999';
            toast.innerHTML = `
                <strong>Obiettivi generati!</strong> ${result.objectives.length} obiettivi aggiunti.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        } else {
            alert(`Errore nella generazione: ${result.error || 'Errore sconosciuto'}`);
        }
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nella comunicazione con il server');
    } finally {
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

async function generateMaterials() {
    if (!currentCourseId) {
        alert('Nessun corso selezionato');
        return;
    }
    
    const title = document.getElementById('lessonTitle').value.trim();
    if (!title) {
        alert('Inserisci prima il titolo della lezione');
        document.getElementById('lessonTitle').focus();
        return;
    }
    
    const button = document.getElementById('generateMaterialsBtn');
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="bi bi-hourglass-split"></i> Generazione...';
    
    try {
        const lessonData = {
            title: title,
            description: document.getElementById('lessonDescription').value.trim(),
            lesson_type: document.getElementById('lessonType').value,
            content: document.getElementById('lessonContent').value.trim()
        };
        
        const response = await fetch(`${API_BASE}/courses/${currentCourseId}/lessons/generate-materials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lessonData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            const currentMaterials = document.getElementById('lessonMaterials').value.trim();
            const newMaterials = result.materials_text;
            
            if (currentMaterials) {
                document.getElementById('lessonMaterials').value = currentMaterials + '\n' + newMaterials;
            } else {
                document.getElementById('lessonMaterials').value = newMaterials;
            }
            
            const toast = document.createElement('div');
            toast.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
            toast.style.zIndex = '9999';
            toast.innerHTML = `
                <strong>Materiali generati!</strong> ${result.materials.length} materiali aggiunti.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        } else {
            alert(`Errore nella generazione: ${result.error || 'Errore sconosciuto'}`);
        }
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nella comunicazione con il server');
    } finally {
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

async function generateExercises() {
    if (!currentCourseId) {
        alert('Nessun corso selezionato');
        return;
    }
    
    const title = document.getElementById('lessonTitle').value.trim();
    if (!title) {
        alert('Inserisci prima il titolo della lezione');
        document.getElementById('lessonTitle').focus();
        return;
    }
    
    const button = document.getElementById('generateExercisesBtn');
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="bi bi-hourglass-split"></i> Generazione...';
    
    try {
        const lessonData = {
            title: title,
            description: document.getElementById('lessonDescription').value.trim(),
            lesson_type: document.getElementById('lessonType').value,
            content: document.getElementById('lessonContent').value.trim(),
            duration_hours: parseFloat(document.getElementById('lessonDuration').value) || 2
        };
        
        const response = await fetch(`${API_BASE}/courses/${currentCourseId}/lessons/generate-exercises`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lessonData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            const currentExercises = document.getElementById('lessonExercises').value.trim();
            const newExercises = result.exercises_text;
            
            if (currentExercises) {
                document.getElementById('lessonExercises').value = currentExercises + '\n' + newExercises;
            } else {
                document.getElementById('lessonExercises').value = newExercises;
            }
            
            const toast = document.createElement('div');
            toast.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
            toast.style.zIndex = '9999';
            toast.innerHTML = `
                <strong>Esercizi generati!</strong> ${result.exercises.length} esercizi aggiunti.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        } else {
            alert(`Errore nella generazione: ${result.error || 'Errore sconosciuto'}`);
        }
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nella comunicazione con il server');
    } finally {
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

function formatMarkdownContent() {
    const contentTextarea = document.getElementById('lessonContent');
    if (!contentTextarea) return;
    
    let content = contentTextarea.value;
    if (!content || !content.trim()) {
        showToast('Nessun contenuto da formattare', 'warning');
        return;
    }
    
    // Converti il Markdown in testo semplice rimuovendo tutti i tag
    const lines = content.split('\n');
    let formattedLines = [];
    let previousWasEmpty = false;
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        const trimmed = line.trim();
        
        // Linea vuota: mantieni solo se necessario
        if (trimmed === '') {
            if (!previousWasEmpty && formattedLines.length > 0) {
                formattedLines.push('');
                previousWasEmpty = true;
            }
            continue;
        }
        
        previousWasEmpty = false;
        let cleanLine = trimmed;
        
        // Rimuovi i tag dei titoli (#, ##, ###, ####)
        if (trimmed.startsWith('#### ')) {
            cleanLine = trimmed.substring(5).trim();
        } else if (trimmed.startsWith('### ') && !trimmed.startsWith('#### ')) {
            cleanLine = trimmed.substring(4).trim();
        } else if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
            cleanLine = trimmed.substring(3).trim();
        } else if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
            cleanLine = trimmed.substring(2).trim();
        }
        // Rimuovi i marker delle liste (- o *)
        else if (trimmed.match(/^[\-\*]\s+(.+)$/)) {
            cleanLine = trimmed.replace(/^[\-\*]\s+/, '').trim();
        }
        // Rimuovi separatori (---, ***, ___)
        else if (trimmed.match(/^[\-\*_]{3,}$/)) {
            // Salta questa linea (separatore)
            continue;
        }
        
        // Rimuovi i tag di formattazione Markdown
        // Rimuovi **testo** (grassetto) e lascia solo testo
        cleanLine = cleanLine.replace(/\*\*(.+?)\*\*/g, '$1');
        // Rimuovi *testo* (corsivo) e lascia solo testo
        cleanLine = cleanLine.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '$1');
        // Rimuovi `testo` (codice inline)
        cleanLine = cleanLine.replace(/`(.+?)`/g, '$1');
        // Rimuovi [testo](url) (link) e lascia solo testo
        cleanLine = cleanLine.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
        // Rimuovi ![alt](url) (immagini)
        cleanLine = cleanLine.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '');
        // Rimuovi ~~testo~~ (barrato)
        cleanLine = cleanLine.replace(/~~(.+?)~~/g, '$1');
        
        // Normalizza spazi multipli
        cleanLine = cleanLine.replace(/[ \t]+/g, ' ').trim();
        
        // Aggiungi la linea pulita se non è vuota
        if (cleanLine) {
            formattedLines.push(cleanLine);
        }
    }
    
    // Rimuovi linee vuote multiple alla fine
    while (formattedLines.length > 0 && formattedLines[formattedLines.length - 1] === '') {
        formattedLines.pop();
    }
    
    // Rimuovi linee vuote multiple consecutive (mantieni massimo 2)
    let finalLines = [];
    let emptyCount = 0;
    for (let i = 0; i < formattedLines.length; i++) {
        if (formattedLines[i] === '') {
            emptyCount++;
            if (emptyCount <= 2) {
                finalLines.push('');
            }
        } else {
            emptyCount = 0;
            finalLines.push(formattedLines[i]);
        }
    }
    
    // Rimuovi linee vuote alla fine
    while (finalLines.length > 0 && finalLines[finalLines.length - 1] === '') {
        finalLines.pop();
    }
    
    // Aggiungi una nuova riga finale se c'è contenuto
    if (finalLines.length > 0) {
        finalLines.push('');
    }
    
    // Unisci le linee formattate
    const formattedContent = finalLines.join('\n');
    
    // Aggiorna il textarea
    contentTextarea.value = formattedContent;
    
    showToast('Markdown convertito in testo semplice', 'success');
}

async function optimizeContent() {
    if (!currentCourseId) {
        alert('Nessun corso selezionato');
        return;
    }
    
    const content = document.getElementById('lessonContent').value.trim();
    if (!content || content.length < 50) {
        alert('Il contenuto è troppo breve per essere ottimizzato. Aggiungi almeno 50 caratteri.');
        document.getElementById('lessonContent').focus();
        return;
    }
    
    if (!confirm('Vuoi ottimizzare il contenuto esistente? Il contenuto attuale verrà sostituito con la versione ottimizzata.')) {
        return;
    }
    
    const button = document.getElementById('optimizeContentBtn');
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="bi bi-hourglass-split"></i> Ottimizzazione...';
    
    try {
        const lessonData = {
            title: document.getElementById('lessonTitle').value.trim(),
            description: document.getElementById('lessonDescription').value.trim(),
            lesson_type: document.getElementById('lessonType').value,
            content: content
        };
        
        const response = await fetch(`${API_BASE}/courses/${currentCourseId}/lessons/optimize-content`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lessonData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            document.getElementById('lessonContent').value = result.optimized_content;
            
            const toast = document.createElement('div');
            toast.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
            toast.style.zIndex = '9999';
            toast.innerHTML = `
                <strong>Contenuto ottimizzato!</strong> Il contenuto è stato migliorato e aggiornato.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        } else {
            alert(`Errore nell'ottimizzazione: ${result.error || 'Errore sconosciuto'}`);
        }
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nella comunicazione con il server');
    } finally {
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

// Funzione per convertire Markdown in HTML con formattazione personalizzata
function convertMarkdownToHTML(markdown) {
    if (!markdown) return '';
    
    const lines = markdown.split('\n');
    let result = [];
    let currentList = [];
    let currentParagraph = [];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        const trimmed = line.trim();
        
        // Linea vuota: chiudi paragrafo o lista corrente
        if (trimmed === '') {
            if (currentList.length > 0) {
                result.push('<ul class="md-list">' + currentList.join('') + '</ul>');
                currentList = [];
            }
            if (currentParagraph.length > 0) {
                result.push('<p class="md-paragraph">' + currentParagraph.join(' ') + '</p>');
                currentParagraph = [];
            }
            continue;
        }
        
        // Titoli (#, ##, ###, ####)
        if (trimmed.startsWith('#### ')) {
            if (currentList.length > 0) {
                result.push('<ul class="md-list">' + currentList.join('') + '</ul>');
                currentList = [];
            }
            if (currentParagraph.length > 0) {
                result.push('<p class="md-paragraph">' + currentParagraph.join(' ') + '</p>');
                currentParagraph = [];
            }
            let title = trimmed.substring(5).trim();
            // Converti **testo** in <strong>testo</strong> nel titolo
            title = title.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            result.push('<h4 class="md-subsection">' + title + '</h4>');
        } else if (trimmed.startsWith('### ')) {
            if (currentList.length > 0) {
                result.push('<ul class="md-list">' + currentList.join('') + '</ul>');
                currentList = [];
            }
            if (currentParagraph.length > 0) {
                result.push('<p class="md-paragraph">' + currentParagraph.join(' ') + '</p>');
                currentParagraph = [];
            }
            let title = trimmed.substring(4).trim();
            title = title.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            result.push('<h3 class="md-section">' + title + '</h3>');
        } else if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
            if (currentList.length > 0) {
                result.push('<ul class="md-list">' + currentList.join('') + '</ul>');
                currentList = [];
            }
            if (currentParagraph.length > 0) {
                result.push('<p class="md-paragraph">' + currentParagraph.join(' ') + '</p>');
                currentParagraph = [];
            }
            let title = trimmed.substring(3).trim();
            // Rimuovi eventuali spazi extra
            title = title.replace(/\s+/g, ' ').trim();
            title = title.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            result.push('<h2 class="md-subtitle">' + title + '</h2>');
        } else if (trimmed.startsWith('# ')) {
            if (currentList.length > 0) {
                result.push('<ul class="md-list">' + currentList.join('') + '</ul>');
                currentList = [];
            }
            if (currentParagraph.length > 0) {
                result.push('<p class="md-paragraph">' + currentParagraph.join(' ') + '</p>');
                currentParagraph = [];
            }
            let title = trimmed.substring(2).trim();
            title = title.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            result.push('<h1 class="md-title">' + title + '</h1>');
        }
        // Liste puntate (- o *)
        else if (trimmed.match(/^[\-\*] (.+)$/)) {
            // Chiudi paragrafo corrente se presente
            if (currentParagraph.length > 0) {
                result.push('<p class="md-paragraph">' + currentParagraph.join(' ') + '</p>');
                currentParagraph = [];
            }
            
            let listItem = trimmed.replace(/^[\-\*] (.+)$/, '$1');
            // Converti **testo** e *testo* nel list item
            listItem = listItem.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            listItem = listItem.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');
            currentList.push('<li class="md-list-item">' + listItem + '</li>');
        }
        // Paragrafo normale
        else {
            // Chiudi lista corrente se presente
            if (currentList.length > 0) {
                result.push('<ul class="md-list">' + currentList.join('') + '</ul>');
                currentList = [];
            }
            
            // Converti **testo** e *testo* nel paragrafo
            let paraLine = trimmed;
            paraLine = paraLine.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            paraLine = paraLine.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');
            currentParagraph.push(paraLine);
        }
    }
    
    // Chiudi liste e paragrafi rimanenti
    if (currentList.length > 0) {
        result.push('<ul class="md-list">' + currentList.join('') + '</ul>');
    }
    if (currentParagraph.length > 0) {
        result.push('<p class="md-paragraph">' + currentParagraph.join(' ') + '</p>');
    }
    
    return result.join('\n');
}

// Variabile globale per salvare il contenuto Markdown completo dell'anteprima
let currentPreviewContent = '';
let currentPreviewLessonId = null;
let currentPreviewLessonTitle = '';

async function showLessonPreview(lessonId) {
    try {
        const response = await fetch(`${API_BASE}/courses/${currentCourseId}`);
        const course = await response.json();
        const lesson = course.lessons.find(l => l.id === lessonId);
        
        if (!lesson) {
            alert('Lezione non trovata');
            return;
        }
        
        // Salva informazioni per l'export
        currentPreviewLessonId = lessonId;
        currentPreviewLessonTitle = lesson.title;
        
        // Imposta il titolo del modal
        document.getElementById('lessonPreviewTitle').textContent = `Anteprima: ${lesson.title}`;
        
        // Prepara tutti i contenuti
        const objectives = lesson.objectives ? (Array.isArray(lesson.objectives) ? lesson.objectives : JSON.parse(lesson.objectives)) : [];
        const materials = lesson.materials ? (Array.isArray(lesson.materials) ? lesson.materials : JSON.parse(lesson.materials)) : [];
        const exercises = lesson.exercises ? (Array.isArray(lesson.exercises) ? lesson.exercises : JSON.parse(lesson.exercises)) : [];
        
        // Costruisci il contenuto: prima il Markdown, poi le sezioni separate
        let fullContent = '';
        
        // Se c'è contenuto Markdown, aggiungilo
        if (lesson.content && lesson.content.trim() !== '') {
            fullContent = lesson.content.trim();
            // Assicurati che termini con una nuova riga
            if (!fullContent.endsWith('\n')) {
                fullContent += '\n';
            }
            fullContent += '\n';
        } else {
            // Se non c'è contenuto, aggiungi solo la sezione Contenuti
            fullContent = '## Contenuti\n\n';
            fullContent += '*Nessun contenuto disponibile.*\n\n';
        }
        
        // Aggiungi SEMPRE le sezioni Obiettivi, Materiali ed Esercizi dopo il contenuto Markdown
        // Queste sono sezioni separate che vengono sempre mostrate
        
        // Sezione Obiettivi
        fullContent += '## Obiettivi\n\n';
        if (objectives && objectives.length > 0) {
            objectives.forEach(obj => {
                fullContent += `- ${obj}\n`;
            });
        } else {
            fullContent += '*Nessun obiettivo specificato.*\n';
        }
        fullContent += '\n';
        
        // Sezione Materiali
        fullContent += '## Materiali\n\n';
        if (materials && materials.length > 0) {
            materials.forEach(mat => {
                fullContent += `- ${mat}\n`;
            });
        } else {
            fullContent += '*Nessun materiale specificato.*\n';
        }
        fullContent += '\n';
        
        // Sezione Esercizi
        fullContent += '## Esercizi\n\n';
        if (exercises && exercises.length > 0) {
            exercises.forEach(ex => {
                fullContent += `- ${ex}\n`;
            });
        } else {
            fullContent += '*Nessun esercizio specificato.*\n';
        }
        fullContent += '\n';
        
        // Salva il contenuto completo per l'export
        currentPreviewContent = fullContent;
        
        // Converti Markdown in HTML con formattazione personalizzata
        const renderedContent = convertMarkdownToHTML(fullContent);
        
        // Mostra il contenuto renderizzato
        document.getElementById('lessonPreviewContent').innerHTML = renderedContent;
        
        // Mostra il modal
        const modal = new bootstrap.Modal(document.getElementById('lessonPreviewModal'));
        modal.show();
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nel caricamento dell\'anteprima della lezione');
    }
}

async function savePdfFromPreview() {
    if (!currentPreviewContent || !currentPreviewLessonId) {
        alert('Nessun contenuto disponibile per l\'esportazione');
        return;
    }
    
    try {
        // Invia il contenuto Markdown completo al backend per generare il PDF
        const response = await fetch(`${API_BASE}/courses/${currentCourseId}/lessons/${currentPreviewLessonId}/export-pdf-from-content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: currentPreviewContent,
                title: currentPreviewLessonTitle
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Errore durante l\'esportazione');
        }
        
        // Scarica il PDF
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentPreviewLessonTitle.replace(/ /g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showToast('PDF generato con successo', 'success');
    } catch (error) {
        console.error('Errore:', error);
        showToast('Errore: ' + error.message, 'error');
    }
}

function exportLesson(lessonId, format) {
    const url = `${API_BASE}/courses/${currentCourseId}/lessons/${lessonId}/export/${format}`;
    window.location.href = url;
}

let currentTrainingCourseId = null;

async function trainAIOnCourse(courseId, courseName, button) {
    currentTrainingCourseId = courseId;
    document.getElementById('trainAIModalTitle').textContent = `Addestra AI - ${courseName}`;
    
    // Carica i materiali esistenti
    await loadTrainingMaterials(courseId);
    
    // Mostra il modal
    const modal = new bootstrap.Modal(document.getElementById('trainAIModal'));
    modal.show();
}

async function loadTrainingMaterials(courseId) {
    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}/training-materials`);
        const materials = await response.json();
        
        const container = document.getElementById('trainingMaterialsList');
        
        if (materials.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-3"><i class="bi bi-inbox"></i> Nessun materiale caricato</div>';
            return;
        }
        
        container.innerHTML = materials.map(m => `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">
                            ${m.material_type === 'file' ? '<i class="bi bi-file-earmark"></i>' : '<i class="bi bi-link-45deg"></i>'}
                            ${m.material_type === 'file' ? m.filename : m.url}
                        </h6>
                        ${m.summary ? `<p class="mb-1 small text-muted">${m.summary.substring(0, 150)}${m.summary.length > 150 ? '...' : ''}</p>` : ''}
                        <small class="text-muted">${new Date(m.created_at).toLocaleString('it-IT')}</small>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteTrainingMaterial(${m.id}, ${courseId})" title="Elimina">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Errore nel caricamento materiali:', error);
        document.getElementById('trainingMaterialsList').innerHTML = '<div class="alert alert-danger">Errore nel caricamento dei materiali</div>';
    }
}

async function deleteTrainingMaterial(materialId, courseId) {
    if (!confirm('Sei sicuro di voler eliminare questo materiale?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}/training-materials/${materialId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Errore nell\'eliminazione');
        }
        
        await loadTrainingMaterials(courseId);
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nell\'eliminazione del materiale');
    }
}

// Gestione form file
document.addEventListener('DOMContentLoaded', () => {
    const fileForm = document.getElementById('trainAIFileForm');
    if (fileForm) {
        fileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fileInput = document.getElementById('trainAIFile');
            const file = fileInput.files[0];
            
            if (!file) {
                alert('Seleziona un file');
                return;
            }
            
            const formData = new FormData();
            formData.append('file', file);
            
            const submitBtn = fileForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Processamento...';
            
            try {
                const response = await fetch(`${API_BASE}/courses/${currentTrainingCourseId}/train-ai`, {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Errore durante il processamento');
                }
                
                alert(`File processato con successo!\n\n${data.message}`);
                fileInput.value = '';
                await loadTrainingMaterials(currentTrainingCourseId);
                
            } catch (error) {
                console.error('Errore:', error);
                alert(`Errore: ${error.message}`);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
    
    // Gestione form URL
    const urlForm = document.getElementById('trainAIURLForm');
    if (urlForm) {
        urlForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const urlInput = document.getElementById('trainAIURL');
            const url = urlInput.value.trim();
            
            if (!url) {
                alert('Inserisci un URL valido');
                return;
            }
            
            const submitBtn = urlForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Processamento...';
            
            try {
                const response = await fetch(`${API_BASE}/courses/${currentTrainingCourseId}/train-ai`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url: url })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Errore durante il processamento');
                }
                
                alert(`URL processato con successo!\n\n${data.message}`);
                urlInput.value = '';
                await loadTrainingMaterials(currentTrainingCourseId);
                
            } catch (error) {
                console.error('Errore:', error);
                alert(`Errore: ${error.message}`);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
});

async function generateQuestions() {
    if (!currentCourseId) {
        alert('Nessun corso selezionato');
        return;
    }
    
    if (!confirm('Vuoi generare 30 domande a risposta multipla per questo corso?\n\nQuesta operazione eliminerà le domande esistenti e ne creerà di nuove.')) {
        return;
    }
    
    const button = document.getElementById('generateQuestionsBtn');
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Generazione...';
    
    try {
        const response = await fetch(`${API_BASE}/courses/${currentCourseId}/generate-questions`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Errore durante la generazione');
        }
        
        alert(`Domande generate con successo!\n\n${data.message}\n\nDistribuzione risposte corrette:\nA: ${data.answer_distribution.A}\nB: ${data.answer_distribution.B}\nC: ${data.answer_distribution.C}\nD: ${data.answer_distribution.D}`);
        
        // Mostra le domande
        showQuestionsModal();
        
    } catch (error) {
        console.error('Errore:', error);
        alert(`Errore durante la generazione: ${error.message}`);
    } finally {
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

async function showQuestionsModal() {
    if (!currentCourseId) {
        alert('Nessun corso selezionato');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/courses/${currentCourseId}/questions`);
        
        if (!response.ok) {
            throw new Error('Errore nel caricamento delle domande');
        }
        
        const questions = await response.json();
        
        const container = document.getElementById('questionsList');
        
        if (questions.length === 0) {
            container.innerHTML = '<div class="alert alert-info"><i class="bi bi-info-circle"></i> Nessuna domanda disponibile. Clicca "Genera Domande" per crearle.</div>';
            const modal = new bootstrap.Modal(document.getElementById('questionsModal'));
            modal.show();
            return;
        }
        
        // Aggiorna il titolo del modal
        document.getElementById('questionsModalTitle').textContent = `Domande del Corso (${questions.length} domande)`;
        
        container.innerHTML = questions.map(q => `
            <div class="card mb-3">
                <div class="card-body">
                    <h6 class="card-title">Domanda ${q.question_number}</h6>
                    <p class="card-text"><strong>${q.question_text}</strong></p>
                    <div class="ms-3">
                        <div class="mb-1"><strong>A)</strong> ${q.option_a}</div>
                        <div class="mb-1"><strong>B)</strong> ${q.option_b}</div>
                        <div class="mb-1"><strong>C)</strong> ${q.option_c}</div>
                        <div class="mb-1"><strong>D)</strong> ${q.option_d}</div>
                    </div>
                    <div class="mt-2">
                        <small class="text-muted">Risposta corretta: <strong class="text-success">${q.correct_answer}</strong></small>
                    </div>
                </div>
            </div>
        `).join('');
        
        const modal = new bootstrap.Modal(document.getElementById('questionsModal'));
        modal.show();
        
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nel caricamento delle domande: ' + error.message);
    }
}

function exportQuestions(format) {
    const url = `${API_BASE}/courses/${currentCourseId}/questions/export/${format}`;
    window.location.href = url;
}

function exportAnswerKey() {
    const url = `${API_BASE}/courses/${currentCourseId}/questions/answer-key`;
    window.location.href = url;
}

let currentFinalReport = null;

function showFinalReportModal() {
    if (!currentCourseId) {
        alert('Nessun corso selezionato');
        return;
    }
    
    // Reset del modal
    document.getElementById('finalReportPrompt').value = '';
    document.getElementById('finalReportResult').style.display = 'none';
    currentFinalReport = null;
    
    const modal = new bootstrap.Modal(document.getElementById('finalReportModal'));
    modal.show();
}

async function generateFinalReport() {
    if (!currentCourseId) {
        alert('Nessun corso selezionato');
        return;
    }
    
    const prompt = document.getElementById('finalReportPrompt').value.trim();
    
    if (!prompt) {
        alert('Inserisci un prompt descrittivo per la relazione');
        return;
    }
    
    const button = document.getElementById('generateFinalReportBtn');
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Generazione...';
    
    try {
        const response = await fetch(`${API_BASE}/courses/${currentCourseId}/final-report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: prompt })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Errore durante la generazione');
        }
        
        currentFinalReport = data.report;
        
        // Mostra la relazione
        const resultDiv = document.getElementById('finalReportResult');
        const contentDiv = document.getElementById('finalReportContent');
        
        // Converti Markdown a HTML usando marked
        if (typeof marked !== 'undefined') {
            contentDiv.innerHTML = marked.parse(data.report);
        } else {
            // Fallback: mostra come testo preformattato
            contentDiv.innerHTML = '<pre style="white-space: pre-wrap; font-family: inherit;">' + 
                data.report.replace(/</g, '&lt;').replace(/>/g, '&gt;') + 
                '</pre>';
        }
        
        resultDiv.style.display = 'block';
        
        // Scroll al risultato
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
    } catch (error) {
        console.error('Errore:', error);
        alert(`Errore durante la generazione: ${error.message}`);
    } finally {
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

async function exportFinalReport(format) {
    if (!currentFinalReport) {
        alert('Genera prima la relazione');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/courses/${currentCourseId}/final-report/export/${format}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ report: currentFinalReport })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Errore durante l\'esportazione');
        }
        
        // Scarica il file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `relazione_finale.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
    } catch (error) {
        console.error('Errore:', error);
        alert(`Errore durante l'esportazione: ${error.message}`);
    }
}

async function createSlides(courseId, courseName) {
    if (!confirm(`Vuoi generare una presentazione PowerPoint per il corso "${courseName}"?\n\nLa presentazione includerà tutte le lezioni del corso.`)) {
        return;
    }
    
    // Trova il pulsante che ha chiamato la funzione
    const button = document.querySelector(`button[onclick*="createSlides(${courseId}"]`);
    const originalText = button ? button.innerHTML : '';
    
    if (button) {
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Generazione...';
    }
    
    try {
        const url = `${API_BASE}/courses/${courseId}/slides`;
        
        // Scarica il file
        const response = await fetch(url);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Errore durante la generazione');
        }
        
        // Ottieni il nome del file dall'header o costruiscilo
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `${courseId}_Presentazione.pptx`;
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].replace(/['"]/g, '');
            }
        }
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        // Aspetta un po' prima di rimuovere l'elemento
        setTimeout(() => {
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
        }, 100);
        
        // Mostra un messaggio più informativo
        const downloadPath = navigator.userAgent.includes('Mac') ? 'la cartella Download' : 'la cartella Download';
        alert(`✅ Presentazione generata con successo!\n\nIl file "${filename}" è stato scaricato nella cartella Download del tuo browser.\n\nSe non vedi il download, controlla:\n- La barra dei download del browser\n- Le impostazioni del browser per i download automatici`);
        
    } catch (error) {
        console.error('Errore:', error);
        alert(`❌ Errore durante la generazione: ${error.message}`);
    } finally {
        // Ripristina il pulsante
        if (button) {
            button.disabled = false;
            button.innerHTML = '<i class="bi bi-file-slides"></i> Crea Slide';
        }
    }
}

async function exportCourseCalendar(courseId, courseName) {
    try {
        // Aggiungi timestamp per evitare cache
        const url = `${API_BASE}/courses/${courseId}/calendar/ics?t=${Date.now()}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            // Prova a leggere come JSON solo se non è un file
            let errorMessage = 'Errore durante l\'esportazione';
            const contentType = response.headers.get('content-type') || '';
            
            if (contentType.includes('application/json')) {
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    errorMessage = `Errore ${response.status}: ${response.statusText}`;
                }
            } else {
                // Se non è JSON, usa il testo della risposta solo se non è HTML
                try {
                    const errorText = await response.text();
                    if (errorText && !errorText.trim().startsWith('<!')) {
                        errorMessage = errorText.substring(0, 200);
                    } else {
                        errorMessage = `Errore ${response.status}: ${response.statusText}`;
                    }
                } catch (e) {
                    errorMessage = `Errore ${response.status}: ${response.statusText}`;
                }
            }
            throw new Error(errorMessage);
        }
        
        // Ottieni il nome del file dall'header o costruiscilo
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `${courseName.replace(/[^a-z0-9]/gi, '_')}_calendario.ics`;
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].replace(/['"]/g, '');
            }
        }
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
        }, 100);
        
        alert(`✅ Calendario esportato con successo!\n\nIl file "${filename}" è stato scaricato e può essere importato in Google Calendar, Outlook, Apple Calendar o altri calendari.`);
        
    } catch (error) {
        console.error('Errore:', error);
        alert(`❌ Errore durante l'esportazione: ${error.message}`);
    }
}

// Funzione Canva in standby
/*
async function createWithCanva(courseId, courseName) {
    if (!confirm(`Vuoi creare una presentazione su Canva per il corso "${courseName}"?\n\nSarai reindirizzato a Canva per autorizzare l'applicazione.`)) {
        return;
    }
    
    try {
        // Inizia il flusso OAuth
        const response = await fetch(`${API_BASE}/canva/auth?course_id=${courseId}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Errore nell\'avvio dell\'autorizzazione');
        }
        
        // Apri una nuova finestra per l'autorizzazione OAuth
        const authWindow = window.open(
            data.auth_url,
            'canva_auth',
            'width=600,height=700,scrollbars=yes,resizable=yes'
        );
        
        // Ascolta il messaggio dal popup quando l'autorizzazione è completata
        window.addEventListener('message', async function(event) {
            if (event.data.type === 'canva_auth_success') {
                authWindow.close();
                
                const accessToken = event.data.access_token;
                const courseIdFromMessage = event.data.course_id;
                
                // Crea la presentazione su Canva
                try {
                    const createResponse = await fetch(`${API_BASE}/courses/${courseIdFromMessage}/canva/create`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            access_token: accessToken
                        })
                    });
                    
                    const createData = await createResponse.json();
                    
                    if (!createResponse.ok) {
                        throw new Error(createData.error || 'Errore nella creazione della presentazione');
                    }
                    
                    // Mostra il risultato
                    if (createData.design_url || createData.edit_url) {
                        const url = createData.edit_url || createData.design_url;
                        if (confirm(`✅ Presentazione creata su Canva con successo!\n\nVuoi aprire la presentazione su Canva?`)) {
                            window.open(url, '_blank');
                        }
                    } else {
                        alert(`✅ Presentazione creata su Canva con successo!\n\nDesign ID: ${createData.design_id}`);
                    }
                    
                } catch (error) {
                    console.error('Errore:', error);
                    alert(`❌ Errore nella creazione della presentazione: ${error.message}`);
                }
                
                // Rimuovi il listener
                window.removeEventListener('message', arguments.callee);
            }
        });
        
        // Controlla se la finestra è stata chiusa manualmente
        const checkClosed = setInterval(() => {
            if (authWindow.closed) {
                clearInterval(checkClosed);
                window.removeEventListener('message', arguments.callee);
            }
        }, 1000);
        
    } catch (error) {
        console.error('Errore:', error);
        alert(`❌ Errore: ${error.message}`);
    }
}
*/

async function deleteLesson(lessonId, lessonTitle) {
    if (!confirm(`Sei sicuro di voler eliminare la lezione "${lessonTitle}"?\n\nQuesta operazione non può essere annullata.`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/courses/${currentCourseId}/lessons/${lessonId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Ricarica le lezioni
            openLessonsModal(currentCourseId);
            alert('Lezione eliminata con successo!');
        } else {
            const result = await response.json();
            alert(`Errore nell'eliminazione della lezione: ${result.error || 'Errore sconosciuto'}`);
        }
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nella comunicazione con il server');
    }
}

async function importFromMarkdown(event) {
    if (!currentCourseId) return;
    
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.md')) {
        alert('Il file deve essere in formato Markdown (.md)');
        return;
    }
    
    if (!confirm('Attenzione: questa operazione eliminerà tutte le lezioni esistenti e le sostituirà con quelle del file. Continuare?')) {
        event.target.value = '';
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(`${API_BASE}/courses/${currentCourseId}/import-md`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(result.message);
            openLessonsModal(currentCourseId);
        } else {
            alert(`Errore: ${result.error}`);
        }
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nella comunicazione con il server');
    } finally {
        event.target.value = '';
    }
}

async function generateCourseFiles() {
    if (!currentCourseId) return;

    try {
        const response = await fetch(`${API_BASE}/courses/${currentCourseId}/generate`, {
            method: 'POST'
        });

        if (response.ok) {
            const result = await response.json();
            alert(`File generati con successo!\n\nPercorso: ${result.path}`);
        } else {
            alert('Errore nella generazione dei file');
        }
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nella comunicazione con il server');
    }
}

// ==================== GESTIONE PREFERENZE ====================

// Variabile globale per le preferenze
let appPreferences = {};

// Carica le preferenze all'avvio
async function loadPreferences() {
    try {
        const response = await fetch(`${API_BASE}/preferences`);
        if (response.ok) {
            appPreferences = await response.json();
            // Applica le preferenze ai form se necessario
            applyPreferencesToUI();
        } else {
            console.warn('Impossibile caricare le preferenze, uso i default');
        }
    } catch (error) {
        console.error('Errore nel caricamento delle preferenze:', error);
    }
}

// Applica le preferenze all'interfaccia utente
function applyPreferencesToUI() {
    // Applica solo se il modal è già stato caricato
    const modal = document.getElementById('preferencesModal');
    if (!modal) return;
    
    // Impostazioni Generali
    if (appPreferences.defaultLessonDuration !== undefined) {
        const el = document.getElementById('defaultLessonDuration');
        if (el) el.value = appPreferences.defaultLessonDuration;
    }
    if (appPreferences.defaultLessonType !== undefined) {
        const el = document.getElementById('defaultLessonType');
        if (el) el.value = appPreferences.defaultLessonType;
    }
    if (appPreferences.defaultLessonTime !== undefined) {
        const el = document.getElementById('defaultLessonTime');
        if (el) el.value = appPreferences.defaultLessonTime;
    }
    
    // Impostazioni Esportazione
    if (appPreferences.exportAuthor !== undefined) {
        const el = document.getElementById('exportAuthor');
        if (el) el.value = appPreferences.exportAuthor || '';
    }
    if (appPreferences.exportCompany !== undefined) {
        const el = document.getElementById('exportCompany');
        if (el) el.value = appPreferences.exportCompany || '';
    }
    if (appPreferences.hourlyRate !== undefined) {
        const el = document.getElementById('hourlyRate');
        if (el) el.value = appPreferences.hourlyRate || 25;
    }
    if (appPreferences.includeFooter !== undefined) {
        const el = document.getElementById('includeFooter');
        if (el) el.checked = appPreferences.includeFooter;
    }
    
    // Impostazioni AI
    if (appPreferences.aiModel !== undefined) {
        const el = document.getElementById('aiModel');
        if (el) el.value = appPreferences.aiModel;
    }
    if (appPreferences.aiTemperature !== undefined) {
        const el = document.getElementById('aiTemperature');
        if (el) el.value = appPreferences.aiTemperature;
    }
    if (appPreferences.aiMaxTokens !== undefined) {
        const el = document.getElementById('aiMaxTokens');
        if (el) el.value = appPreferences.aiMaxTokens;
    }
    if (appPreferences.autoExpandLessons !== undefined) {
        const el = document.getElementById('autoExpandLessons');
        if (el) el.checked = appPreferences.autoExpandLessons;
    }
    
    // Impostazioni Domande
    if (appPreferences.questionsCount !== undefined) {
        const el = document.getElementById('questionsCount');
        if (el) el.value = appPreferences.questionsCount;
    }
    if (appPreferences.questionsOptions !== undefined) {
        const el = document.getElementById('questionsOptions');
        if (el) el.value = appPreferences.questionsOptions;
    }
    
    // Impostazioni Presentazioni
    if (appPreferences.slidesPerLesson !== undefined) {
        const el = document.getElementById('slidesPerLesson');
        if (el) el.value = appPreferences.slidesPerLesson;
    }
    if (appPreferences.includeImages !== undefined) {
        const el = document.getElementById('includeImages');
        if (el) el.checked = appPreferences.includeImages;
    }
    
    // Impostazioni Avanzate
    if (appPreferences.coursesDir !== undefined) {
        const el = document.getElementById('coursesDir');
        if (el) el.value = appPreferences.coursesDir;
    }
    if (appPreferences.mdSourceDir !== undefined) {
        const el = document.getElementById('mdSourceDir');
        if (el) el.value = appPreferences.mdSourceDir;
    }
    if (appPreferences.enableDebugLogs !== undefined) {
        const el = document.getElementById('enableDebugLogs');
        if (el) el.checked = appPreferences.enableDebugLogs;
    }
}

// Mostra il modal delle preferenze
async function showPreferencesModal() {
    const modal = new bootstrap.Modal(document.getElementById('preferencesModal'));
    
    // Carica le preferenze se non sono già caricate
    if (Object.keys(appPreferences).length === 0) {
        await loadPreferences();
    } else {
        applyPreferencesToUI();
    }
    
    modal.show();
}

// Salva le preferenze
async function savePreferences() {
    try {
        // Raccogli tutti i valori dal form
        const preferences = {
            defaultLessonDuration: parseFloat(document.getElementById('defaultLessonDuration').value) || 2.0,
            defaultLessonType: document.getElementById('defaultLessonType').value,
            defaultLessonTime: document.getElementById('defaultLessonTime').value,
            exportAuthor: document.getElementById('exportAuthor').value,
            exportCompany: document.getElementById('exportCompany').value,
            hourlyRate: parseFloat(document.getElementById('hourlyRate').value) || 25,
            includeFooter: document.getElementById('includeFooter').checked,
            aiModel: document.getElementById('aiModel').value,
            aiTemperature: parseFloat(document.getElementById('aiTemperature').value) || 0.7,
            aiMaxTokens: parseInt(document.getElementById('aiMaxTokens').value) || 2000,
            autoExpandLessons: document.getElementById('autoExpandLessons').checked,
            questionsCount: parseInt(document.getElementById('questionsCount').value) || 30,
            questionsOptions: parseInt(document.getElementById('questionsOptions').value) || 4,
            slidesPerLesson: parseInt(document.getElementById('slidesPerLesson').value) || 10,
            includeImages: document.getElementById('includeImages').checked,
            coursesDir: document.getElementById('coursesDir').value,
            mdSourceDir: document.getElementById('mdSourceDir').value,
            enableDebugLogs: document.getElementById('enableDebugLogs').checked
        };
        
        const response = await fetch(`${API_BASE}/preferences`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preferences)
        });
        
        if (response.ok) {
            const result = await response.json();
            appPreferences = preferences; // Aggiorna le preferenze locali
            alert('✅ Preferenze salvate con successo!');
            
            // Chiudi il modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('preferencesModal'));
            if (modal) modal.hide();
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Errore nel salvataggio');
        }
    } catch (error) {
        console.error('Errore:', error);
        alert(`❌ Errore durante il salvataggio: ${error.message}`);
    }
}

// ==================== DASHBOARD ====================

let dashboardCharts = {
    hoursPerCourse: null,
    theoryPractice: null,
    revenue: null
};

let modifiedLessonsPagination = {
    currentPage: 1,
    perPage: 5,
    totalPages: 1,
    total: 0
};

let recentCoursesPagination = {
    currentPage: 1,
    perPage: 5,
    totalPages: 1,
    total: 0
};

let upcomingLessonsPagination = {
    currentPage: 1,
    perPage: 5,
    totalPages: 1,
    total: 0
};

let exportedCoursesPagination = {
    currentPage: 1,
    perPage: 5,
    totalPages: 1,
    total: 0
};

// ==================== TEMPLATE E DUPLICAZIONE ====================

async function showTemplatesModal() {
    const modal = new bootstrap.Modal(document.getElementById('templatesModal'));
    modal.show();
    await loadTemplates();
}

async function loadTemplates() {
    try {
        const response = await fetch(`${API_BASE}/templates`);
        if (!response.ok) {
            throw new Error('Errore nel caricamento template');
        }
        const templates = await response.json();
        displayTemplates(templates);
    } catch (error) {
        console.error('Errore:', error);
        document.getElementById('templatesList').innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle"></i> Errore nel caricamento template: ${error.message}
            </div>
        `;
    }
}

function displayTemplates(templates) {
    const container = document.getElementById('templatesList');
    if (templates.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="bi bi-info-circle"></i> Nessun template disponibile. Salva un corso come template per iniziare.
            </div>
        `;
        return;
    }
    
    container.innerHTML = templates.map(template => {
        const date = template.created_at ? new Date(template.created_at).toLocaleDateString('it-IT') : 'N/A';
        return `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h6 class="card-title">
                                ${template.name}
                                ${template.is_predefined ? '<span class="badge bg-primary ms-2">Predefinito</span>' : ''}
                            </h6>
                            <p class="card-text text-muted small">${template.description || 'Nessuna descrizione'}</p>
                            <small class="text-muted">
                                <i class="bi bi-calendar"></i> Creato: ${date}
                                ${template.code_prefix ? ` • Prefisso: <code>${template.code_prefix}</code>` : ''}
                            </small>
                        </div>
                        <div class="btn-group-vertical ms-3">
                            <button class="btn btn-sm btn-primary" onclick="createCourseFromTemplate(${template.id})">
                                <i class="bi bi-plus-circle"></i> Usa Template
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="exportTemplate(${template.id})">
                                <i class="bi bi-download"></i> Esporta
                            </button>
                            ${!template.is_predefined ? `
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteTemplate(${template.id}, '${template.name.replace(/'/g, "\\'")}')">
                                    <i class="bi bi-trash"></i> Elimina
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function createCourseFromTemplate(templateId) {
    const templateName = prompt('Inserisci il nome per il nuovo corso:');
    if (!templateName) return;
    
    const code = prompt('Inserisci il codice per il nuovo corso (opzionale):') || '';
    
    try {
        const response = await fetch(`${API_BASE}/courses/from-template`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                template_id: templateId,
                name: templateName,
                code: code
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            alert(`Corso "${templateName}" creato con successo!`);
            const modal = bootstrap.Modal.getInstance(document.getElementById('templatesModal'));
            modal.hide();
            loadCourses();
        } else {
            const error = await response.json();
            alert(`Errore: ${error.error || 'Errore nella creazione del corso'}`);
        }
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nella comunicazione con il server');
    }
}

async function saveAsTemplate(courseId, courseName) {
    const templateName = prompt(`Inserisci il nome per il template (default: "Template: ${courseName}"):`, `Template: ${courseName}`);
    if (!templateName) return;
    
    const description = prompt('Inserisci una descrizione per il template (opzionale):') || '';
    const codePrefix = prompt('Inserisci un prefisso per il codice corso (default: TEMPLATE_):', 'TEMPLATE_') || 'TEMPLATE_';
    
    try {
        const response = await fetch(`${API_BASE}/templates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                course_id: courseId,
                template_name: templateName,
                template_description: description,
                code_prefix: codePrefix
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            alert(`Template "${templateName}" creato con successo!`);
        } else {
            const error = await response.json();
            alert(`Errore: ${error.error || 'Errore nella creazione del template'}`);
        }
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nella comunicazione con il server');
    }
}

let currentExportCourseId = null;
let currentExportCourseName = null;

function showExportModal(courseId, courseName) {
    currentExportCourseId = courseId;
    currentExportCourseName = courseName;
    
    document.getElementById('exportCourseName').textContent = courseName;
    
    // Reset form
    document.getElementById('exportAllLessons').checked = true;
    document.getElementById('exportFormat').value = 'pdf';
    document.getElementById('exportQuestions').checked = false;
    document.getElementById('exportFinalReport').checked = false;
    document.getElementById('exportAsZip').checked = false;
    document.getElementById('exportProgress').style.display = 'none';
    document.getElementById('startExportBtn').disabled = false;
    
    const modal = new bootstrap.Modal(document.getElementById('exportModal'));
    modal.show();
}

async function startExport() {
    if (!currentExportCourseId) {
        showToast('Nessun corso selezionato', 'error');
        return;
    }
    
    const exportAllLessons = document.getElementById('exportAllLessons').checked;
    const exportFormat = document.getElementById('exportFormat').value;
    const exportQuestions = document.getElementById('exportQuestions').checked;
    const exportFinalReport = document.getElementById('exportFinalReport').checked;
    const exportAsZip = document.getElementById('exportAsZip').checked;
    
    if (!exportAllLessons && !exportQuestions && !exportFinalReport) {
        showToast('Seleziona almeno un\'opzione di esportazione', 'warning');
        return;
    }
    
    // Mostra progress bar
    document.getElementById('exportProgress').style.display = 'block';
    document.getElementById('exportProgressBar').style.width = '0%';
    document.getElementById('exportStatus').textContent = 'Preparazione esportazione...';
    document.getElementById('startExportBtn').disabled = true;
    
    try {
        // Prepara i parametri
        const params = new URLSearchParams({
            format: exportFormat,
            include_questions: exportQuestions ? 'true' : 'false',
            include_final_report: exportFinalReport ? 'true' : 'false',
            as_zip: exportAsZip ? 'true' : 'false'
        });
        
        // Aggiorna progress
        document.getElementById('exportProgressBar').style.width = '30%';
        document.getElementById('exportStatus').textContent = 'Generazione documenti...';
        
        // Chiama l'endpoint di esportazione
        const response = await fetch(`${API_BASE}/courses/${currentExportCourseId}/export-batch?${params}`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Errore durante l\'esportazione');
        }
        
        // Aggiorna progress
        document.getElementById('exportProgressBar').style.width = '80%';
        document.getElementById('exportStatus').textContent = 'Download in corso...';
        
        // Scarica il file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Determina il nome del file
        const extension = exportAsZip ? 'zip' : exportFormat;
        const sanitizedName = currentExportCourseName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        a.download = `${sanitizedName}_export.${extension}`;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Completa progress
        document.getElementById('exportProgressBar').style.width = '100%';
        document.getElementById('exportStatus').textContent = 'Esportazione completata!';
        
        showToast('Esportazione completata con successo', 'success');
        
        // Chiudi la modale dopo 1 secondo
        setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('exportModal'));
            if (modal) {
                modal.hide();
            }
        }, 1000);
        
    } catch (error) {
        console.error('Errore:', error);
        showToast('Errore: ' + error.message, 'error');
        document.getElementById('exportProgress').style.display = 'none';
        document.getElementById('startExportBtn').disabled = false;
    }
}

let currentAIAnalysisCourseId = null;
let currentAIAnalysisCourseName = null;
let currentAIAnalysisType = null;
let currentAIAnalysisResult = null;

function showAIAnalysisModal(courseId, courseName) {
    currentAIAnalysisCourseId = courseId;
    currentAIAnalysisCourseName = courseName;
    
    document.getElementById('aiAnalysisCourseName').textContent = courseName;
    document.getElementById('aiAnalysisProgress').style.display = 'none';
    document.getElementById('aiAnalysisResults').style.display = 'none';
    document.getElementById('aiAnalysisResultsContent').innerHTML = '';
    
    // Reset tab alla prima tab
    const firstTab = document.getElementById('new-analysis-tab');
    const firstPane = document.getElementById('new-analysis-pane');
    const savedTab = document.getElementById('saved-analyses-tab');
    const savedPane = document.getElementById('saved-analyses-pane');
    
    firstTab.classList.add('active');
    firstPane.classList.add('active', 'show');
    savedTab.classList.remove('active');
    savedPane.classList.remove('active', 'show');
    
    const modal = new bootstrap.Modal(document.getElementById('aiAnalysisModal'));
    modal.show();
}

async function loadSavedAnalyses() {
    if (!currentAIAnalysisCourseId) {
        return;
    }
    
    const container = document.getElementById('savedAnalysesList');
    container.innerHTML = '<div class="text-center text-muted py-3"><i class="bi bi-hourglass-split"></i> Caricamento analisi salvate...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/courses/${currentAIAnalysisCourseId}/ai-analyses`);
        
        if (!response.ok) {
            throw new Error('Errore nel caricamento delle analisi');
        }
        
        const analyses = await response.json();
        
        if (analyses.length === 0) {
            container.innerHTML = '<div class="alert alert-info">Nessuna analisi salvata per questo corso.</div>';
            return;
        }
        
        const analysisTypeNames = {
            'balance': 'Bilanciamento Teoria/Pratica',
            'suggestions': 'Suggerimenti Miglioramento',
            'duplicates': 'Contenuti Duplicati',
            'coherence': 'Coerenza Obiettivi'
        };
        
        const analysisTypeIcons = {
            'balance': 'bi-balance',
            'suggestions': 'bi-lightbulb',
            'duplicates': 'bi-files',
            'coherence': 'bi-check-circle'
        };
        
        let html = '<div class="list-group">';
        analyses.forEach(analysis => {
            const typeName = analysisTypeNames[analysis.analysis_type] || analysis.analysis_type;
            const typeIcon = analysisTypeIcons[analysis.analysis_type] || 'bi-file-text';
            
            html += `
                <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h6 class="mb-1">
                                <i class="bi ${typeIcon}"></i> ${analysis.title}
                            </h6>
                            <p class="mb-1 text-muted small">${typeName}</p>
                            <small class="text-muted">${analysis.created_at_formatted}</small>
                        </div>
                        <div class="btn-group" role="group">
                            <button type="button" class="btn btn-sm btn-outline-primary" onclick="viewSavedAnalysis(${analysis.id})" title="Visualizza">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-success" onclick="downloadSavedAnalysis(${analysis.id}, 'pdf')" title="Scarica PDF">
                                <i class="bi bi-file-pdf"></i>
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-info" onclick="downloadSavedAnalysis(${analysis.id}, 'docx')" title="Scarica DOCX">
                                <i class="bi bi-file-word"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Errore:', error);
        container.innerHTML = `<div class="alert alert-danger">Errore nel caricamento: ${error.message}</div>`;
    }
}

async function viewSavedAnalysis(analysisId) {
    if (!currentAIAnalysisCourseId) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/courses/${currentAIAnalysisCourseId}/ai-analyses/${analysisId}`);
        
        if (!response.ok) {
            throw new Error('Errore nel caricamento dell\'analisi');
        }
        
        const analysis = await response.json();
        
        // Salva per l'esportazione
        currentAIAnalysisType = analysis.analysis_type;
        currentAIAnalysisResult = {
            analysis: analysis.analysis,
            title: analysis.title,
            data: analysis.data
        };
        
        // Mostra nella sezione risultati
        displayAIAnalysisResults(analysis.analysis_type, analysis);
        
        // Passa alla tab nuova analisi per vedere i risultati
        const firstTab = document.getElementById('new-analysis-tab');
        const firstPane = document.getElementById('new-analysis-pane');
        firstTab.click();
        
        // Scroll ai risultati
        setTimeout(() => {
            const resultsDiv = document.getElementById('aiAnalysisResults');
            if (resultsDiv) {
                resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 100);
        
    } catch (error) {
        console.error('Errore:', error);
        showToast('Errore: ' + error.message, 'error');
    }
}

function downloadSavedAnalysis(analysisId, format) {
    if (!currentAIAnalysisCourseId) {
        return;
    }
    
    // Crea un link di download diretto
    const url = `${API_BASE}/courses/${currentAIAnalysisCourseId}/ai-analyses/${analysisId}/export/${format}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showToast(`Download ${format.toUpperCase()} avviato`, 'success');
}

async function runAIAnalysis(analysisType) {
    if (!currentAIAnalysisCourseId) {
        showToast('Nessun corso selezionato', 'error');
        return;
    }
    
    // Mostra progress bar
    document.getElementById('aiAnalysisProgress').style.display = 'block';
    document.getElementById('aiAnalysisResults').style.display = 'none';
    document.getElementById('aiAnalysisProgressBar').style.width = '0%';
    document.getElementById('aiAnalysisStatus').textContent = 'Preparazione analisi...';
    
    const analysisNames = {
        'balance': 'Bilanciamento Teoria/Pratica',
        'suggestions': 'Suggerimenti Miglioramento',
        'duplicates': 'Contenuti Duplicati',
        'coherence': 'Coerenza Obiettivi'
    };
    
    try {
        // Aggiorna progress
        document.getElementById('aiAnalysisProgressBar').style.width = '30%';
        document.getElementById('aiAnalysisStatus').textContent = `Esecuzione analisi: ${analysisNames[analysisType]}...`;
        
        // Chiama l'endpoint di analisi
        const response = await fetch(`${API_BASE}/courses/${currentAIAnalysisCourseId}/ai-analysis/${analysisType}`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Errore durante l\'analisi');
        }
        
        // Aggiorna progress
        document.getElementById('aiAnalysisProgressBar').style.width = '80%';
        document.getElementById('aiAnalysisStatus').textContent = 'Elaborazione risultati...';
        
        const result = await response.json();
        
        // Completa progress
        document.getElementById('aiAnalysisProgressBar').style.width = '100%';
        document.getElementById('aiAnalysisStatus').textContent = 'Analisi completata!';
        
        // Salva i risultati per l'esportazione
        currentAIAnalysisType = analysisType;
        currentAIAnalysisResult = result;
        
        // Mostra risultati
        displayAIAnalysisResults(analysisType, result);
        
        showToast('Analisi completata con successo', 'success');
        
    } catch (error) {
        console.error('Errore:', error);
        showToast('Errore: ' + error.message, 'error');
        document.getElementById('aiAnalysisProgress').style.display = 'none';
    }
}

function displayAIAnalysisResults(analysisType, result) {
    const resultsDiv = document.getElementById('aiAnalysisResults');
    const contentDiv = document.getElementById('aiAnalysisResultsContent');
    
    let html = `<h6 class="mb-3">${result.title || 'Risultati Analisi'}</h6>`;
    
    if (result.analysis) {
        // Converti Markdown in HTML se presente
        if (typeof result.analysis === 'string') {
            // Usa la funzione di conversione Markdown esistente
            html += `<div class="markdown-preview">${convertMarkdownToHTML(result.analysis)}</div>`;
        } else {
            html += `<pre class="bg-white p-3 rounded">${JSON.stringify(result.analysis, null, 2)}</pre>`;
        }
    } else if (result.summary) {
        html += `<div class="markdown-preview">${convertMarkdownToHTML(result.summary)}</div>`;
    } else {
        html += `<p class="text-muted">Nessun risultato disponibile.</p>`;
    }
    
    if (result.recommendations && result.recommendations.length > 0) {
        html += `<hr><h6 class="mb-2">Raccomandazioni:</h6><ul class="list-group">`;
        result.recommendations.forEach(rec => {
            html += `<li class="list-group-item">${rec}</li>`;
        });
        html += `</ul>`;
    }
    
    contentDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
    
    // Scroll ai risultati
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function exportAIAnalysis(format) {
    if (!currentAIAnalysisCourseId || !currentAIAnalysisResult) {
        showToast('Nessun risultato di analisi disponibile per l\'esportazione', 'warning');
        return;
    }
    
    try {
        const analysisNames = {
            'balance': 'Bilanciamento_Teoria_Pratica',
            'suggestions': 'Suggerimenti_Miglioramento',
            'duplicates': 'Contenuti_Duplicati',
            'coherence': 'Coerenza_Obiettivi'
        };
        
        const analysisName = analysisNames[currentAIAnalysisType] || 'Analisi';
        const sanitizedCourseName = currentAIAnalysisCourseName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        // Chiama l'endpoint di esportazione
        const response = await fetch(`${API_BASE}/courses/${currentAIAnalysisCourseId}/ai-analysis/${currentAIAnalysisType}/export/${format}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                analysis: currentAIAnalysisResult.analysis,
                title: currentAIAnalysisResult.title,
                data: currentAIAnalysisResult.data
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Errore durante l\'esportazione');
        }
        
        // Scarica il file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sanitizedCourseName}_${analysisName}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showToast(`Analisi esportata in ${format.toUpperCase()} con successo`, 'success');
        
    } catch (error) {
        console.error('Errore:', error);
        showToast('Errore: ' + error.message, 'error');
    }
}

async function duplicateCourse(courseId, courseName) {
    const newName = prompt(`Inserisci il nome per il corso duplicato (default: "${courseName} (Copia)"):`, `${courseName} (Copia)`);
    if (!newName) return;
    
    const newCode = prompt('Inserisci il codice per il corso duplicato (opzionale, verrà generato automaticamente se vuoto):') || '';
    
    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}/duplicate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                new_name: newName,
                new_code: newCode
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            alert(`Corso "${newName}" duplicato con successo!`);
            loadCourses();
        } else {
            const error = await response.json();
            alert(`Errore: ${error.error || 'Errore nella duplicazione del corso'}`);
        }
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nella comunicazione con il server');
    }
}

async function deleteTemplate(templateId, templateName) {
    if (!confirm(`Sei sicuro di voler eliminare il template "${templateName}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/templates/${templateId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Template eliminato con successo!');
            loadTemplates();
        } else {
            const error = await response.json();
            alert(`Errore: ${error.error || 'Errore nell\'eliminazione del template'}`);
        }
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nella comunicazione con il server');
    }
}

async function exportTemplate(templateId) {
    try {
        const response = await fetch(`${API_BASE}/templates/${templateId}/export`);
        if (!response.ok) {
            throw new Error('Errore nell\'esportazione');
        }
        const data = await response.json();
        
        // Crea e scarica il file JSON
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `template_${data.name.replace(/[^a-z0-9]/gi, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Template esportato con successo!');
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nell\'esportazione del template');
    }
}

function showImportTemplateDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            const response = await fetch(`${API_BASE}/templates/import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                const result = await response.json();
                alert('Template importato con successo!');
                loadTemplates();
            } else {
                const error = await response.json();
                alert(`Errore: ${error.error || 'Errore nell\'importazione del template'}`);
            }
        } catch (error) {
            console.error('Errore:', error);
            alert('Errore nella lettura del file o formato non valido');
        }
    };
    input.click();
}

function showDashboard() {
    // Mostra dashboard, nascondi corsi
    document.getElementById('dashboardSection').style.display = 'block';
    document.getElementById('coursesSection').style.display = 'none';
    
    // Carica le statistiche
    loadDashboardStats();
}

function showCourses() {
    // Mostra corsi, nascondi dashboard
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('coursesSection').style.display = 'block';
    
    // Distruggi i grafici quando si esce dalla dashboard
    destroyCharts();
}

async function loadDashboardStats(recentPage = 1, upcomingPage = 1) {
    try {
        const response = await fetch(`${API_BASE}/dashboard/stats?recent_page=${recentPage}&recent_per_page=${recentCoursesPagination.perPage}&upcoming_page=${upcomingPage}&upcoming_per_page=${upcomingLessonsPagination.perPage}`);
        if (!response.ok) {
            throw new Error('Errore nel caricamento delle statistiche');
        }
        
        const stats = await response.json();
        
        // Aggiorna statistiche generali
        document.getElementById('totalCourses').textContent = stats.total_courses;
        document.getElementById('totalHours').textContent = stats.total_hours.toFixed(1);
        document.getElementById('totalLessons').textContent = stats.total_lessons;
        document.getElementById('totalRevenue').textContent = `€${stats.total_revenue.toFixed(2)}`;
        
        // Inizializza grafici
        initHoursPerCourseChart(stats.hours_per_course);
        initTheoryPracticeChart(stats.theory_practice_dist);
        
        // Aggiorna paginazione corsi recenti
        if (stats.recent_pagination) {
            recentCoursesPagination.currentPage = stats.recent_pagination.page;
            recentCoursesPagination.totalPages = stats.recent_pagination.total_pages;
            recentCoursesPagination.total = stats.recent_pagination.total;
        }
        displayRecentCourses(stats.recent_courses);
        updateRecentCoursesPagination();
        
        // Aggiorna paginazione prossime lezioni
        if (stats.upcoming_pagination) {
            upcomingLessonsPagination.currentPage = stats.upcoming_pagination.page;
            upcomingLessonsPagination.totalPages = stats.upcoming_pagination.total_pages;
            upcomingLessonsPagination.total = stats.upcoming_pagination.total;
        }
        displayUpcomingLessons(stats.upcoming_lessons);
        updateUpcomingLessonsPagination();
        
        // Carica importi per periodo
        loadRevenueByPeriod();
        
        // Carica statistiche utilizzo
        loadUsageStats();
        
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nel caricamento delle statistiche della dashboard');
    }
}

function loadRecentCoursesPage(direction) {
    const newPage = recentCoursesPagination.currentPage + direction;
    if (newPage >= 1 && newPage <= recentCoursesPagination.totalPages) {
        loadDashboardStats(newPage, upcomingLessonsPagination.currentPage);
    }
}

function loadUpcomingLessonsPage(direction) {
    const newPage = upcomingLessonsPagination.currentPage + direction;
    if (newPage >= 1 && newPage <= upcomingLessonsPagination.totalPages) {
        loadDashboardStats(recentCoursesPagination.currentPage, newPage);
    }
}

function updateRecentCoursesPagination() {
    const paginationDiv = document.getElementById('recentCoursesPagination');
    const prevBtn = document.getElementById('recentPrevBtn');
    const nextBtn = document.getElementById('recentNextBtn');
    const pageInfo = document.getElementById('recentPageInfo');
    
    if (!paginationDiv || !prevBtn || !nextBtn || !pageInfo) return;
    
    if (recentCoursesPagination.totalPages > 1) {
        paginationDiv.style.display = 'flex';
        pageInfo.textContent = `Pagina ${recentCoursesPagination.currentPage} di ${recentCoursesPagination.totalPages} (${recentCoursesPagination.total} totali)`;
        prevBtn.disabled = recentCoursesPagination.currentPage <= 1;
        nextBtn.disabled = recentCoursesPagination.currentPage >= recentCoursesPagination.totalPages;
    } else {
        paginationDiv.style.display = 'none';
    }
}

function updateUpcomingLessonsPagination() {
    const paginationDiv = document.getElementById('upcomingLessonsPagination');
    const prevBtn = document.getElementById('upcomingPrevBtn');
    const nextBtn = document.getElementById('upcomingNextBtn');
    const pageInfo = document.getElementById('upcomingPageInfo');
    
    if (!paginationDiv || !prevBtn || !nextBtn || !pageInfo) return;
    
    if (upcomingLessonsPagination.totalPages > 1) {
        paginationDiv.style.display = 'flex';
        pageInfo.textContent = `Pagina ${upcomingLessonsPagination.currentPage} di ${upcomingLessonsPagination.totalPages} (${upcomingLessonsPagination.total} totali)`;
        prevBtn.disabled = upcomingLessonsPagination.currentPage <= 1;
        nextBtn.disabled = upcomingLessonsPagination.currentPage >= upcomingLessonsPagination.totalPages;
    } else {
        paginationDiv.style.display = 'none';
    }
}

function initHoursPerCourseChart(data) {
    const ctx = document.getElementById('hoursPerCourseChart');
    if (!ctx) return;
    
    // Distruggi grafico esistente se presente
    if (dashboardCharts.hoursPerCourse) {
        dashboardCharts.hoursPerCourse.destroy();
    }
    
    dashboardCharts.hoursPerCourse = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(c => c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name),
            datasets: [{
                label: 'Ore Totali',
                data: data.map(c => c.hours),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + 'h';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function initTheoryPracticeChart(data) {
    const ctx = document.getElementById('theoryPracticeChart');
    if (!ctx) return;
    
    // Distruggi grafico esistente se presente
    if (dashboardCharts.theoryPractice) {
        dashboardCharts.theoryPractice.destroy();
    }
    
    dashboardCharts.theoryPractice = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Teoria', 'Pratica'],
            datasets: [{
                data: [data.theory, data.practice],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 99, 132, 0.6)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value}h (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function displayRecentCourses(courses) {
    const container = document.getElementById('recentCoursesList');
    if (!container) return;
    
    if (courses.length === 0) {
        container.innerHTML = '<p class="text-muted">Nessun corso disponibile.</p>';
        return;
    }
    
    container.innerHTML = courses.map(course => {
        const date = course.created_at ? new Date(course.created_at).toLocaleDateString('it-IT') : 'N/A';
        return `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                <div>
                    <strong>${course.name}</strong>
                    <br>
                    <small class="text-muted">${course.code} • ${course.total_hours}h</small>
                </div>
                <small class="text-muted">${date}</small>
            </div>
        `;
    }).join('');
}

function displayUpcomingLessons(lessons) {
    const container = document.getElementById('upcomingLessonsList');
    if (!container) return;
    
    if (lessons.length === 0) {
        container.innerHTML = '<p class="text-muted">Nessuna lezione programmata.</p>';
        return;
    }
    
    container.innerHTML = lessons.map(lesson => {
        const date = lesson.lesson_date ? formatDate(lesson.lesson_date) : 'N/A';
        const typeBadge = lesson.lesson_type === 'theory' 
            ? '<span class="badge bg-success">Teorica</span>' 
            : '<span class="badge bg-danger">Pratica</span>';
        return `
            <div class="d-flex justify-content-between align-items-start mb-2 p-2 border-bottom">
                <div>
                    <strong>${lesson.title}</strong>
                    <br>
                    <small class="text-muted">${lesson.course_name} (${lesson.course_code})</small>
                    <br>
                    ${typeBadge} <span class="badge bg-secondary">${lesson.duration_hours}h</span>
                </div>
                <small class="text-muted">${date}</small>
            </div>
        `;
    }).join('');
}

async function loadRevenueByPeriod() {
    const period = document.getElementById('periodSelect').value;
    
    try {
        const response = await fetch(`${API_BASE}/dashboard/revenue?period=${period}`);
        if (!response.ok) {
            throw new Error('Errore nel caricamento degli importi');
        }
        
        const data = await response.json();
        
        // Inizializza grafico importi
        initRevenueChart(data.revenue_by_month);
        
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nel caricamento degli importi per periodo');
    }
}

function initRevenueChart(data) {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    // Distruggi grafico esistente se presente
    if (dashboardCharts.revenue) {
        dashboardCharts.revenue.destroy();
    }
    
    // Formatta le etichette dei mesi
    const labels = data.map(d => {
        const [year, month] = d.month.split('-');
        const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    });
    
    dashboardCharts.revenue = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Importo (€)',
                data: data.map(d => d.revenue),
                borderColor: 'rgba(255, 206, 86, 1)',
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '€' + value.toFixed(2);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Importo: €' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

async function loadUsageStats(modifiedPage = 1, exportedPage = 1) {
    try {
        const response = await fetch(`${API_BASE}/dashboard/usage-stats?page=${modifiedPage}&per_page=${modifiedLessonsPagination.perPage}&exported_page=${exportedPage}&exported_per_page=${exportedCoursesPagination.perPage}`);
        if (!response.ok) {
            throw new Error('Errore nel caricamento delle statistiche di utilizzo');
        }
        
        const stats = await response.json();
        
        // Aggiorna paginazione lezioni modificate
        if (stats.modified_pagination) {
            modifiedLessonsPagination.currentPage = stats.modified_pagination.page;
            modifiedLessonsPagination.totalPages = stats.modified_pagination.total_pages;
            modifiedLessonsPagination.total = stats.modified_pagination.total;
        }
        displayMostModifiedLessons(stats.most_modified_lessons);
        updatePaginationControls();
        
        // Aggiorna paginazione corsi esportati
        if (stats.exported_pagination) {
            exportedCoursesPagination.currentPage = stats.exported_pagination.page;
            exportedCoursesPagination.totalPages = stats.exported_pagination.total_pages;
            exportedCoursesPagination.total = stats.exported_pagination.total;
        }
        displayMostExportedCourses(stats.most_exported_courses);
        updateExportedCoursesPagination();
        
    } catch (error) {
        console.error('Errore:', error);
        // Non mostrare alert, solo log
    }
}

function loadExportedCoursesPage(direction) {
    const newPage = exportedCoursesPagination.currentPage + direction;
    if (newPage >= 1 && newPage <= exportedCoursesPagination.totalPages) {
        loadUsageStats(modifiedLessonsPagination.currentPage, newPage);
    }
}

function updateExportedCoursesPagination() {
    const paginationDiv = document.getElementById('exportedCoursesPagination');
    const prevBtn = document.getElementById('exportedPrevBtn');
    const nextBtn = document.getElementById('exportedNextBtn');
    const pageInfo = document.getElementById('exportedPageInfo');
    
    if (!paginationDiv || !prevBtn || !nextBtn || !pageInfo) return;
    
    if (exportedCoursesPagination.totalPages > 1) {
        paginationDiv.style.display = 'flex';
        pageInfo.textContent = `Pagina ${exportedCoursesPagination.currentPage} di ${exportedCoursesPagination.totalPages} (${exportedCoursesPagination.total} totali)`;
        prevBtn.disabled = exportedCoursesPagination.currentPage <= 1;
        nextBtn.disabled = exportedCoursesPagination.currentPage >= exportedCoursesPagination.totalPages;
    } else {
        paginationDiv.style.display = 'none';
    }
}

function loadModifiedLessonsPage(direction) {
    const newPage = modifiedLessonsPagination.currentPage + direction;
    if (newPage >= 1 && newPage <= modifiedLessonsPagination.totalPages) {
        loadUsageStats(newPage);
    }
}

function updatePaginationControls() {
    const paginationDiv = document.getElementById('lessonsPagination');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const pageInfo = document.getElementById('pageInfo');
    
    if (!paginationDiv || !prevBtn || !nextBtn || !pageInfo) return;
    
    // Mostra paginazione solo se ci sono più pagine
    if (modifiedLessonsPagination.totalPages > 1) {
        paginationDiv.style.display = 'flex';
        
        // Aggiorna info pagina
        pageInfo.textContent = `Pagina ${modifiedLessonsPagination.currentPage} di ${modifiedLessonsPagination.totalPages} (${modifiedLessonsPagination.total} totali)`;
        
        // Abilita/disabilita pulsanti
        prevBtn.disabled = modifiedLessonsPagination.currentPage <= 1;
        nextBtn.disabled = modifiedLessonsPagination.currentPage >= modifiedLessonsPagination.totalPages;
    } else {
        paginationDiv.style.display = 'none';
    }
}

function displayMostModifiedLessons(lessons) {
    const container = document.getElementById('mostModifiedLessonsList');
    if (!container) return;
    
    if (lessons.length === 0) {
        container.innerHTML = '<p class="text-muted">Nessuna lezione modificata ancora.</p>';
        return;
    }
    
    container.innerHTML = lessons.map(lesson => {
        const date = lesson.last_modified ? new Date(lesson.last_modified).toLocaleDateString('it-IT') : 'N/A';
        return `
            <div class="d-flex justify-content-between align-items-start mb-2 p-2 border-bottom">
                <div>
                    <strong>${lesson.title}</strong>
                    <br>
                    <small class="text-muted">${lesson.course_name} (${lesson.course_code})</small>
                    <br>
                    <span class="badge bg-info">${lesson.modification_count} modifiche</span>
                </div>
                <small class="text-muted">${date}</small>
            </div>
        `;
    }).join('');
}

function displayMostExportedCourses(courses) {
    const container = document.getElementById('mostExportedCoursesList');
    if (!container) return;
    
    if (courses.length === 0) {
        container.innerHTML = '<p class="text-muted">Nessun corso esportato ancora.</p>';
        return;
    }
    
    container.innerHTML = courses.map(course => {
        return `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                <div>
                    <strong>${course.name}</strong>
                    <br>
                    <small class="text-muted">${course.code} • ${course.total_hours}h</small>
                </div>
                <span class="badge bg-success">${course.export_count} esportazioni</span>
            </div>
        `;
    }).join('');
}

function destroyCharts() {
    if (dashboardCharts.hoursPerCourse) {
        dashboardCharts.hoursPerCourse.destroy();
        dashboardCharts.hoursPerCourse = null;
    }
    if (dashboardCharts.theoryPractice) {
        dashboardCharts.theoryPractice.destroy();
        dashboardCharts.theoryPractice = null;
    }
    if (dashboardCharts.revenue) {
        dashboardCharts.revenue.destroy();
        dashboardCharts.revenue = null;
    }
}

