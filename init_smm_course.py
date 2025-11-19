#!/usr/bin/env python3
"""
Script per inizializzare il corso Social Media Marketing (SMM)
con struttura base di 40h teoriche + 40h pratiche
"""

from app import app, db, Course, Lesson
import json

def init_smm_course():
    with app.app_context():
        # Verifica se il corso esiste già
        existing = Course.query.filter_by(code='SMM').first()
        if existing:
            print("Il corso SMM esiste già. Eliminare prima di re-inizializzare.")
            return

        # Crea il corso
        course = Course(
            code='SMM',
            name='Social Media Marketing',
            description='Corso completo di Social Media Marketing per professionisti. Il corso copre strategie, strumenti e tecniche pratiche per gestire efficacemente la presenza sui social media.',
            total_hours=80,
            theory_hours=40,
            practice_hours=40
        )
        db.session.add(course)
        db.session.flush()

        # Lezioni teoriche (40 ore)
        theory_lessons = [
            {
                'title': 'Introduzione al Social Media Marketing',
                'description': 'Panoramica del mondo dei social media e loro importanza nel marketing moderno',
                'duration_hours': 2,
                'order': 1,
                'content': '''## Introduzione

Il Social Media Marketing (SMM) è diventato una componente fondamentale della strategia di marketing per aziende di ogni dimensione.

### Argomenti Principali

- Storia ed evoluzione dei social media
- Importanza dei social media nel marketing moderno
- Statistiche e trend del settore
- ROI e metriche di successo''',
                'objectives': [
                    'Comprendere l\'evoluzione dei social media',
                    'Identificare le opportunità di business sui social',
                    'Conoscere le principali piattaforme e il loro utilizzo'
                ],
                'materials': [
                    'Slide presentazione',
                    'Case study aziende di successo',
                    'Report statistiche social media 2024'
                ],
                'exercises': [
                    'Analisi di 3 brand e la loro presenza social',
                    'Identificazione del target audience per un caso studio'
                ]
            },
            {
                'title': 'Strategia e Pianificazione Social Media',
                'description': 'Come creare una strategia efficace e un piano editoriale',
                'duration_hours': 4,
                'order': 2,
                'content': '''## Strategia Social Media

Una strategia ben definita è la base per il successo sui social media.

### Elementi Chiave

- Definizione degli obiettivi (SMART)
- Analisi del target audience
- Scelta delle piattaforme
- Brand voice e tone of voice
- Piano editoriale e calendario contenuti''',
                'objectives': [
                    'Saper creare una strategia social media completa',
                    'Definire obiettivi misurabili',
                    'Sviluppare un piano editoriale efficace'
                ],
                'materials': [
                    'Template strategia social media',
                    'Tool per pianificazione contenuti',
                    'Esempi di piani editoriali'
                ],
                'exercises': [
                    'Creazione strategia per un brand fittizio',
                    'Sviluppo piano editoriale mensile'
                ]
            },
            {
                'title': 'Facebook e Instagram Marketing',
                'description': 'Strategie avanzate per Facebook e Instagram',
                'duration_hours': 6,
                'order': 3,
                'content': '''## Facebook e Instagram

Le due piattaforme più importanti per il marketing B2C.

### Facebook Marketing

- Creazione e ottimizzazione pagina business
- Facebook Ads e targeting avanzato
- Facebook Groups e community building
- Insights e analisi performance

### Instagram Marketing

- Strategia contenuti (feed, stories, reels)
- Hashtag strategy
- Instagram Shopping
- Collaborazioni e influencer marketing''',
                'objectives': [
                    'Padroneggiare le funzionalità business di Facebook',
                    'Creare contenuti efficaci per Instagram',
                    'Utilizzare Facebook Ads per campagne mirate'
                ],
                'materials': [
                    'Guida Facebook Business Manager',
                    'Best practices Instagram',
                    'Tool per scheduling contenuti'
                ],
                'exercises': [
                    'Creazione campagna Facebook Ads',
                    'Pianificazione contenuti Instagram per 1 settimana'
                ]
            },
            {
                'title': 'LinkedIn e Twitter/X Marketing',
                'description': 'Marketing professionale su LinkedIn e Twitter',
                'duration_hours': 4,
                'order': 4,
                'content': '''## LinkedIn e Twitter/X

Piattaforme essenziali per il B2B e la comunicazione professionale.

### LinkedIn Marketing

- Ottimizzazione profilo aziendale
- Content marketing B2B
- LinkedIn Ads e lead generation
- Networking e relationship building

### Twitter/X Marketing

- Strategia contenuti e engagement
- Twitter Ads
- Community management
- Crisis management''',
                'objectives': [
                    'Utilizzare LinkedIn per lead generation',
                    'Creare contenuti B2B efficaci',
                    'Gestire presenza professionale su Twitter/X'
                ],
                'materials': [
                    'Guida LinkedIn Marketing',
                    'Best practices Twitter/X',
                    'Case study B2B'
                ],
                'exercises': [
                    'Ottimizzazione profilo LinkedIn aziendale',
                    'Creazione serie di tweet per un evento'
                ]
            },
            {
                'title': 'TikTok, YouTube e Piattaforme Emergenti',
                'description': 'Marketing su piattaforme video e emergenti',
                'duration_hours': 4,
                'order': 5,
                'content': '''## Piattaforme Video e Emergenti

Il video è il formato dominante nei social media.

### TikTok Marketing

- Strategia contenuti virali
- TikTok Ads
- Creator partnerships
- Trend e challenges

### YouTube Marketing

- YouTube SEO
- Strategia contenuti long-form
- YouTube Shorts
- Monetizzazione e partnership

### Piattaforme Emergenti

- Threads, Bluesky, Mastodon
- Strategia multi-piattaforma''',
                'objectives': [
                    'Comprendere il marketing su TikTok',
                    'Sviluppare strategia YouTube',
                    'Valutare nuove piattaforme'
                ],
                'materials': [
                    'Guida TikTok per business',
                    'YouTube Creator Academy',
                    'Report piattaforme emergenti'
                ],
                'exercises': [
                    'Creazione concept video TikTok',
                    'Pianificazione contenuti YouTube'
                ]
            },
            {
                'title': 'Content Creation e Visual Design',
                'description': 'Creazione di contenuti visivamente accattivanti',
                'duration_hours': 4,
                'order': 6,
                'content': '''## Content Creation

La qualità dei contenuti determina il successo sui social.

### Visual Design

- Principi di design per social media
- Brand identity e coerenza visiva
- Tool per creazione grafica (Canva, Figma)
- Formati ottimali per ogni piattaforma

### Copywriting Social

- Scrittura efficace per social
- Call-to-action ottimizzati
- Storytelling e narrazione
- Emoji e hashtag strategy''',
                'objectives': [
                    'Creare contenuti visivamente accattivanti',
                    'Scrivere copy efficaci per social',
                    'Utilizzare tool di design'
                ],
                'materials': [
                    'Template grafici social media',
                    'Guida copywriting social',
                    'Tool design gratuiti e a pagamento'
                ],
                'exercises': [
                    'Creazione set di post per Instagram',
                    'Scrittura copy per diverse piattaforme'
                ]
            },
            {
                'title': 'Social Media Advertising',
                'description': 'Pubblicità a pagamento su social media',
                'duration_hours': 6,
                'order': 7,
                'content': '''## Social Media Advertising

Le campagne a pagamento amplificano la portata organica.

### Fondamenti di Social Advertising

- Quando investire in advertising
- Budgeting e bidding strategies
- Targeting avanzato
- A/B testing e ottimizzazione

### Piattaforme Ads

- Facebook/Instagram Ads
- LinkedIn Ads
- Twitter Ads
- TikTok Ads
- YouTube Ads''',
                'objectives': [
                    'Creare campagne pubblicitarie efficaci',
                    'Ottimizzare budget e targeting',
                    'Analizzare performance e ROI'
                ],
                'materials': [
                    'Guida completa Facebook Ads',
                    'Best practices per ogni piattaforma',
                    'Tool di analisi e reporting'
                ],
                'exercises': [
                    'Creazione campagna completa Facebook Ads',
                    'Analisi e ottimizzazione campagna esistente'
                ]
            },
            {
                'title': 'Analytics e Metriche di Performance',
                'description': 'Misurazione e analisi dei risultati',
                'duration_hours': 4,
                'order': 8,
                'content': '''## Analytics Social Media

Misurare per migliorare: l'analisi dei dati guida le decisioni.

### Metriche Chiave

- Engagement rate
- Reach e impressions
- Click-through rate (CTR)
- Conversion rate
- Cost per acquisition (CPA)

### Tool di Analytics

- Native analytics (Facebook Insights, Instagram Insights, etc.)
- Google Analytics per social
- Tool terze parti (Hootsuite, Sprout Social, Buffer)
- Dashboard personalizzate''',
                'objectives': [
                    'Identificare metriche rilevanti per gli obiettivi',
                    'Utilizzare tool di analytics',
                    'Creare report efficaci'
                ],
                'materials': [
                    'Guida metriche social media',
                    'Template report performance',
                    'Tool analytics gratuiti e premium'
                ],
                'exercises': [
                    'Analisi performance account social',
                    'Creazione report mensile'
                ]
            },
            {
                'title': 'Community Management e Customer Service',
                'description': 'Gestione della community e servizio clienti',
                'duration_hours': 4,
                'order': 9,
                'content': '''## Community Management

Costruire e mantenere una community attiva è fondamentale.

### Community Building

- Strategie di engagement
- User-generated content (UGC)
- Gestione commenti e messaggi
- Crisis management e reputation

### Customer Service Social

- Social customer care
- Response time e SLA
- Escalation e risoluzione problemi
- Feedback e miglioramento continuo''',
                'objectives': [
                    'Gestire efficacemente una community',
                    'Fornire customer service via social',
                    'Gestire situazioni di crisi'
                ],
                'materials': [
                    'Best practices community management',
                    'Template risposte comuni',
                    'Case study crisis management'
                ],
                'exercises': [
                    'Simulazione gestione commenti negativi',
                    'Creazione piano crisis management'
                ]
            },
            {
                'title': 'Influencer Marketing e Partnership',
                'description': 'Collaborazioni con influencer e creator',
                'duration_hours': 2,
                'order': 10,
                'content': '''## Influencer Marketing

Le partnership con creator amplificano la portata e la credibilità.

### Strategia Influencer

- Identificazione influencer rilevanti
- Tipologie di collaborazione
- Contratti e compensi
- Misurazione ROI influencer marketing

### Micro e Macro Influencer

- Quando scegliere micro vs macro
- Nano-influencer e brand ambassador
- Long-term partnerships''',
                'objectives': [
                    'Identificare influencer adatti al brand',
                    'Strutturare collaborazioni efficaci',
                    'Misurare risultati influencer marketing'
                ],
                'materials': [
                    'Database influencer per settore',
                    'Template contratti collaborazione',
                    'Tool ricerca influencer'
                ],
                'exercises': [
                    'Ricerca e selezione influencer per brand',
                    'Pianificazione campagna influencer'
                ]
            }
        ]

        # Lezioni pratiche (40 ore)
        practice_lessons = [
            {
                'title': 'Laboratorio: Setup Account Business',
                'description': 'Configurazione pratica di account business su tutte le piattaforme',
                'duration_hours': 4,
                'order': 11,
                'content': '''## Setup Pratico Account Business

Configurazione completa di account business su tutte le principali piattaforme.

### Attività Pratiche

- Creazione e ottimizzazione Facebook Business Page
- Setup Instagram Business Account
- Configurazione LinkedIn Company Page
- Setup Twitter Business Account
- Verifica account e badge blu (dove applicabile)''',
                'objectives': [
                    'Configurare correttamente account business',
                    'Ottimizzare profili per massima visibilità',
                    'Collegare account e strumenti'
                ],
                'materials': [
                    'Account di test per ogni piattaforma',
                    'Checklist setup account',
                    'Guida passo-passo per ogni piattaforma'
                ],
                'exercises': [
                    'Setup completo account per brand fittizio',
                    'Ottimizzazione profili esistenti'
                ]
            },
            {
                'title': 'Laboratorio: Creazione Contenuti',
                'description': 'Creazione pratica di contenuti per diverse piattaforme',
                'duration_hours': 6,
                'order': 12,
                'content': '''## Creazione Contenuti Pratica

Hands-on sulla creazione di contenuti efficaci.

### Attività

- Creazione grafiche con Canva/Figma
- Scrittura copy per diversi formati
- Creazione video con smartphone
- Editing base video e foto
- Creazione carousel e stories''',
                'objectives': [
                    'Creare contenuti professionali',
                    'Utilizzare tool di design',
                    'Produrre contenuti per ogni piattaforma'
                ],
                'materials': [
                    'Accesso a Canva Pro',
                    'Tool editing video gratuiti',
                    'Libreria asset grafici',
                    'Smartphone per riprese'
                ],
                'exercises': [
                    'Creazione set 10 post Instagram',
                    'Creazione 5 video TikTok',
                    'Creazione 3 carousel LinkedIn'
                ]
            },
            {
                'title': 'Laboratorio: Facebook e Instagram Ads',
                'description': 'Creazione e gestione campagne pubblicitarie',
                'duration_hours': 6,
                'order': 13,
                'content': '''## Facebook e Instagram Ads Pratico

Creazione e ottimizzazione campagne pubblicitarie reali.

### Attività

- Setup Facebook Business Manager
- Creazione prima campagna
- Targeting avanzato
- Creazione ad set multipli
- A/B testing
- Analisi risultati e ottimizzazione''',
                'objectives': [
                    'Creare campagne Facebook/Instagram Ads',
                    'Configurare targeting efficace',
                    'Ottimizzare campagne per migliori risultati'
                ],
                'materials': [
                    'Account Facebook Business Manager',
                    'Budget di test (€50-100)',
                    'Tool di analisi',
                    'Template campagne'
                ],
                'exercises': [
                    'Creazione campagna completa con 3 ad set',
                    'Analisi e ottimizzazione campagna',
                    'Report risultati e learnings'
                ]
            },
            {
                'title': 'Laboratorio: LinkedIn Ads e B2B',
                'description': 'Campagne LinkedIn per lead generation B2B',
                'duration_hours': 4,
                'order': 14,
                'content': '''## LinkedIn Ads B2B

Strategie pratiche per lead generation su LinkedIn.

### Attività

- Setup LinkedIn Campaign Manager
- Creazione campagne lead generation
- LinkedIn Lead Gen Forms
- Sponsored Content
- Message Ads
- Retargeting LinkedIn''',
                'objectives': [
                    'Creare campagne LinkedIn efficaci',
                    'Utilizzare LinkedIn per lead generation',
                    'Misurare ROI campagne B2B'
                ],
                'materials': [
                    'Account LinkedIn Sales Navigator',
                    'Budget di test',
                    'Landing page per lead capture'
                ],
                'exercises': [
                    'Creazione campagna LinkedIn Lead Gen',
                    'Setup funnel completo B2B'
                ]
            },
            {
                'title': 'Laboratorio: Content Calendar e Scheduling',
                'description': 'Pianificazione e scheduling contenuti',
                'duration_hours': 4,
                'order': 15,
                'content': '''## Content Calendar Pratico

Pianificazione e automazione della pubblicazione.

### Attività

- Creazione content calendar mensile
- Utilizzo tool scheduling (Buffer, Hootsuite, Later)
- Automazione pubblicazioni
- Gestione multi-piattaforma
- Ottimizzazione timing pubblicazione''',
                'objectives': [
                    'Creare content calendar efficace',
                    'Utilizzare tool di scheduling',
                    'Automatizzare pubblicazioni'
                ],
                'materials': [
                    'Account tool scheduling',
                    'Template content calendar',
                    'Analisi best time to post'
                ],
                'exercises': [
                    'Creazione content calendar 1 mese',
                    'Setup automazione per 2 settimane'
                ]
            },
            {
                'title': 'Laboratorio: Analytics e Reporting',
                'description': 'Analisi dati e creazione report',
                'duration_hours': 4,
                'order': 16,
                'content': '''## Analytics Pratico

Analisi approfondita dei dati e creazione report.

### Attività

- Navigazione Facebook/Instagram Insights
- Google Analytics per social traffic
- Creazione dashboard personalizzate
- Analisi competitor
- Report mensile completo
- Presentazione risultati''',
                'objectives': [
                    'Analizzare dati social media',
                    'Creare report efficaci',
                    'Presentare risultati a stakeholder'
                ],
                'materials': [
                    'Accesso a account con dati reali',
                    'Tool analytics avanzati',
                    'Template report',
                    'Tool competitor analysis'
                ],
                'exercises': [
                    'Analisi completa account esistente',
                    'Creazione report mensile professionale',
                    'Presentazione risultati (simulazione)'
                ]
            },
            {
                'title': 'Laboratorio: Community Management',
                'description': 'Gestione pratica della community',
                'duration_hours': 4,
                'order': 17,
                'content': '''## Community Management Pratico

Gestione attiva di community e engagement.

### Attività

- Risposta a commenti e messaggi
- Gestione recensioni
- Creazione contenuti user-generated
- Organizzazione contest e giveaway
- Gestione situazioni critiche
- Building community engagement''',
                'objectives': [
                    'Gestire community attiva',
                    'Aumentare engagement',
                    'Gestire situazioni difficili'
                ],
                'materials': [
                    'Account social per test',
                    'Tool community management',
                    'Template risposte',
                    'Case study'
                ],
                'exercises': [
                    'Gestione community per 1 settimana',
                    'Organizzazione contest social',
                    'Simulazione crisis management'
                ]
            },
            {
                'title': 'Laboratorio: Progetto Finale - Campagna Completa',
                'description': 'Progetto finale: creazione campagna social media completa',
                'duration_hours': 8,
                'order': 18,
                'content': '''## Progetto Finale

Creazione di una campagna social media completa end-to-end.

### Fasi del Progetto

1. **Analisi e Strategia**
   - Analisi brand e competitor
   - Definizione obiettivi
   - Identificazione target audience
   - Scelta piattaforme

2. **Pianificazione**
   - Content strategy
   - Content calendar 1 mese
   - Budget allocation
   - KPI e metriche

3. **Esecuzione**
   - Creazione contenuti
   - Setup campagne advertising
   - Community management
   - Monitoring e ottimizzazione

4. **Reporting**
   - Analisi risultati
   - Report finale
   - Presentazione progetto''',
                'objectives': [
                    'Applicare tutte le competenze acquisite',
                    'Creare campagna completa professionale',
                    'Presentare progetto finale'
                ],
                'materials': [
                    'Tutti i tool e risorse del corso',
                    'Template progetto finale',
                    'Rubrica valutazione'
                ],
                'exercises': [
                    'Progetto completo campagna social media',
                    'Presentazione progetto finale',
                    'Peer review progetti'
                ]
            }
        ]

        # Aggiungi tutte le lezioni
        all_lessons = theory_lessons + practice_lessons
        for lesson_data in all_lessons:
            lesson = Lesson(
                course_id=course.id,
                title=lesson_data['title'],
                description=lesson_data['description'],
                lesson_type='theory' if lesson_data['order'] <= 10 else 'practice',
                duration_hours=lesson_data['duration_hours'],
                order=lesson_data['order'],
                content=lesson_data['content'],
                objectives=json.dumps(lesson_data['objectives']),
                materials=json.dumps(lesson_data['materials']),
                exercises=json.dumps(lesson_data['exercises'])
            )
            db.session.add(lesson)

        db.session.commit()
        print(f"✅ Corso SMM inizializzato con successo!")
        print(f"   - {len(theory_lessons)} lezioni teoriche ({sum(l['duration_hours'] for l in theory_lessons)}h)")
        print(f"   - {len(practice_lessons)} lezioni pratiche ({sum(l['duration_hours'] for l in practice_lessons)}h)")
        print(f"   - Totale: {len(all_lessons)} lezioni, 80 ore")

if __name__ == '__main__':
    init_smm_course()

