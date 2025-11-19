# Configurazione Integrazione ChatGPT

## Descrizione

Il sistema supporta l'espansione automatica delle lezioni usando ChatGPT. Quando crei lezioni da un file Markdown, ottieni contenuti base che possono essere dettagliati e approfonditi con un click.

## Configurazione

### 1. Ottieni una API Key di OpenAI

1. Vai su https://platform.openai.com/
2. Crea un account o accedi
3. Vai alla sezione "API Keys"
4. Crea una nuova API key
5. Copia la chiave (inizia con `sk-...`)

### 2. Configura la variabile d'ambiente

#### Opzione A: Docker Compose (Consigliato)

Aggiungi la variabile d'ambiente al file `.env` nella root del progetto:

```bash
OPENAI_API_KEY=sk-tua-chiave-api-qui
```

Oppure esportala prima di avviare Docker:

```bash
export OPENAI_API_KEY=sk-tua-chiave-api-qui
docker-compose up -d
```

#### Opzione B: Variabile d'ambiente del sistema

```bash
export OPENAI_API_KEY=sk-tua-chiave-api-qui
```

## Utilizzo

1. **Crea lezioni da file Markdown**: Le lezioni vengono create con contenuti base estratti dal file MD
2. **Espandi con ChatGPT**: 
   - Apri "Gestisci Lezioni" per un corso
   - Clicca il pulsante verde "ChatGPT" accanto a una lezione
   - Conferma l'operazione
   - Il sistema chiamerà ChatGPT per espandere e dettagliare il contenuto
   - Il contenuto espanso viene aggiunto alla lezione (mantiene il contenuto originale)

## Come funziona

1. Il sistema invia a ChatGPT:
   - Informazioni sul corso (nome, durata)
   - Dettagli della lezione (titolo, descrizione, obiettivi, contenuto attuale)
   - Istruzioni per espandere il contenuto in formato professionale

2. ChatGPT genera:
   - Contenuto dettagliato in formato Markdown
   - Sezioni strutturate (Introduzione, Contenuti principali, Esempi, Riepilogo)
   - Contenuto adatto a un corso regionale di formazione professionale

3. Il contenuto viene aggiunto alla lezione:
   - Se c'è già contenuto, viene aggiunto dopo un separatore
   - Se non c'è contenuto, viene sostituito completamente

## Modello utilizzato

Il sistema usa **GPT-4o-mini** per bilanciare qualità e costi.

## Costi

- Il modello GPT-4o-mini è economico
- Ogni espansione consuma circa 1000-2000 token
- Controlla i tuoi costi su https://platform.openai.com/usage

## Troubleshooting

### Errore: "API key di OpenAI non configurata"

- Verifica che la variabile `OPENAI_API_KEY` sia impostata
- Riavvia il container Docker dopo aver impostato la variabile
- Verifica che la chiave sia valida su https://platform.openai.com/

### Errore durante l'espansione

- Verifica che la tua API key abbia crediti disponibili
- Controlla i log del server per dettagli sull'errore
- Assicurati che la connessione internet sia attiva

