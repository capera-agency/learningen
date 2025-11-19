# Formato File Markdown per Import Lezioni

## Struttura Richiesta

Il file Markdown deve seguire questa struttura per ogni lezione:

```markdown
## Titolo Lezione

### Descrizione
Descrizione breve della lezione

### Tipo
Teorica o Pratica

### Durata
Numero di ore (es: 2, 4.5, 6)

### Contenuti
Contenuto dettagliato della lezione in formato Markdown.
Può includere:
- Liste
- Paragrafi
- Sottotitoli (####)
- Link
- Formattazione

### Obiettivi
- Obiettivo 1
- Obiettivo 2
- Obiettivo 3

### Materiali
- Materiale 1
- Materiale 2

### Esercizi
- Esercizio 1
- Esercizio 2
```

## Note Importanti

1. **Ogni lezione inizia con `##`** (due cancellette)
2. **Le sezioni iniziano con `###`** (tre cancellette)
3. **Le liste usano `-`** (trattino)
4. **Il tipo deve essere "Teorica" o "Pratica"**
5. **La durata può essere un numero decimale** (es: 2.5 ore)

## Esempio Completo

Vedi il file `ESEMPIO_IMPORT.md` per un esempio completo.

## Come Usare

1. Crea un file `.md` con la struttura sopra descritta
2. Vai su "Gestisci Lezioni" del corso
3. Clicca su "Importa da Markdown"
4. Seleziona il file
5. Le lezioni esistenti verranno sostituite con quelle del file

**ATTENZIONE**: L'import elimina tutte le lezioni esistenti e le sostituisce con quelle del file!

