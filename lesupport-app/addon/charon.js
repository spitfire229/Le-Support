// Chemins vers les fichiers JSON
const knowledgeFilePath = './addon/charon-knowledge.json';
const codePenalPath = './codes/code_pénal.json';
const codecivilPath = './codes/code_civil.json';
const codeProcedurecivilePath = './codes/code_procedure_civile.json';
const commandSuggestions = [
    "/définition",
    "/article code pénal",
    "/article code civil",
    "/article code procédure civile",
    "/auteur",
    "/jurisprudence"
];

// Fonction pour normaliser les chaînes de caractères
function normalized(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Variables globales
let charonKnowledge = [];
let charonModel = null;
let codePenal = {};
let codeCivil = {};
let codeProcedurecivile = {};





// Fonction pour échapper les caractères HTML
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag]));
}

// Chargement des fichiers JSON
async function loadKnowledgeBase() {
    try {
        const response = await fetch(knowledgeFilePath);
        if (!response.ok) throw new Error("Échec du chargement du fichier JSON.");
        const data = await response.json();
        charonKnowledge = data.intents || [];
        console.log("Base de connaissances chargée.");
    } catch (error) {
        console.error("Erreur de chargement de la base de connaissances :", error);
    }
}

async function loadCodePenal() {
    try {
        const response = await fetch(codePenalPath);
        if (!response.ok) throw new Error("Échec du chargement du code pénal.");
        const data = await response.json();
        codePenal = data;
        console.log("Code pénal chargé.");
    } catch (error) {
        console.error("Erreur de chargement du code pénal :", error);
    }
}



async function loadCodeCivil() {
    try {
        const response = await fetch(codecivilPath);
        if (!response.ok) throw new Error("Échec du chargement du code civil.");
        const data = await response.json();
        codeCivil = data;
        console.log("Code civil chargé.");
    } catch (error) {
        console.error("Erreur de chargement du code civil :", error);
    }
}

async function loadCodeProcedureCivile() {
    try {
        const response = await fetch(codeProcedurecivilePath);
        if (!response.ok) throw new Error("Échec du chargement du code de procédure civile.");
        const data = await response.json();
        codeProcedurecivile = data;
        console.log("Code de procédure civile chargé.");
    } catch (error) {
        console.error("Erreur de chargement du code de procédure civile :", error);
    }
}



async function loadCharonModel() {
    try {
        const pipeline = window.transformers.pipeline;
        charonModel = await pipeline('text-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
        console.log('Charon est prêt avec le modèle IA.');
    } catch (error) {
        console.error("Erreur de chargement du modèle IA :", error);
    }
}

async function getCharonResponse(message) {
    const lowerMessage = normalized(message).trim();

    if (lowerMessage === "/") {
        return `
            <strong>Liste des commandes disponibles :</strong><br>
            <ul>
                <li><code>/definition &lt;mot&gt;</code> — Définit un terme</li>
                <li><code>/article code pénal &lt;numéro&gt;</code> — Affiche un article du code pénal</li>
                <li><code>/auteur &lt;nom&gt;</code> — Recherche une figure/auteur historique</li>
                <li><code>/jurisprudence &lt;nom/date&gt;</code> — Recherche une jurisprudence</li>
            </ul>
        `;
    }

    if (lowerMessage.startsWith("/definition") || lowerMessage.startsWith("/def") || lowerMessage.startsWith("/définition")) {
        const parts = lowerMessage.split(" ");
        if (parts.length < 2) return "Veuillez spécifier un mot à définir.";
        const word = parts[1];

        const localMatch = charonKnowledge.find(intent =>
            intent.keywords.some(keyword => normalized(keyword) === normalized(word))
        );

        if (localMatch) {
            return `<strong>${escapeHTML(word)} (Base locale)</strong> : ${escapeHTML(localMatch.response)}`;
        }

        const wikiDef = await fetchWikipediaDefinition(word);
        return `<strong>${escapeHTML(word)} (Module Wikipedia V1.0)</strong> : ${escapeHTML(wikiDef)}`;
    }

    if (lowerMessage.startsWith("/article code penal") || lowerMessage.startsWith("/article code pénal") ||
        lowerMessage.startsWith("/art code penal") || lowerMessage.startsWith("/art code pénal")) {
        const parts = lowerMessage.split(" ");
        const articleNumber = parts[parts.length - 1];
        const articleContent = codePenal[articleNumber];
        if (articleContent) {
            return `<strong>Article ${escapeHTML(articleNumber)} du Code pénal (2025) :</strong> ${escapeHTML(articleContent)}`;
        } else {
            return `Je n'ai pas trouvé l'article ${escapeHTML(articleNumber)} dans le Code pénal.`;
        }
    }

if (lowerMessage.startsWith("/article code civil") || lowerMessage.startsWith("/art code civil")) {
    const parts = lowerMessage.split(" ");
    const articleNumber = parts[parts.length - 1];
    const articleContent = codeCivil[articleNumber];
    if (articleContent) {
        return `<strong>Article ${escapeHTML(articleNumber)} du Code civil (2025) :</strong> ${escapeHTML(articleContent)}`;
    } else {
        return `Je n'ai pas trouvé l'article ${escapeHTML(articleNumber)} dans le Code civil.`;
    }
}


if (lowerMessage.startsWith("/article code procedure civile") || lowerMessage.startsWith("/art code procedure civile") || lowerMessage.startsWith("/art code procédure civile") || lowerMessage.startsWith("/article code procédure civile")) {
    const parts = lowerMessage.split(" ");
    const articleNumber = parts[parts.length - 1];
    const articleContent = codeProcedurecivile[articleNumber];
    if (articleContent) {
        return `<strong>Article ${escapeHTML(articleNumber)} du Code de procédure civile (2025) :</strong> ${escapeHTML(articleContent)}`;
    } else {
        return `Je n'ai pas trouvé l'article ${escapeHTML(articleNumber)} dans le Code de procédure civile.`;
    }
}



    if (lowerMessage.startsWith("/auteur")) {
        const parts = message.trim().split(" ");
        if (parts.length < 2) return "Veuillez spécifier un nom d’auteur.";
        const auteurNom = parts.slice(1).join(" ").toLowerCase();

        try {
            const response = await fetch("https://lesupport.me/Json/figures.json");
            if (!response.ok) throw new Error("Erreur lors du chargement des données auteurs.");
            const auteurs = await response.json();

            const auteur = auteurs.find(a => a.nom.toLowerCase().includes(auteurNom));
            if (!auteur) return `Aucun auteur trouvé pour : <strong>${escapeHTML(auteurNom)}</strong>.`;

            return `
                <strong>${escapeHTML(auteur.nom)}</strong> (${escapeHTML(auteur.periode)})<br>
                <img src="${escapeHTML(auteur.image)}" alt="${escapeHTML(auteur.nom)}" style="max-width: 150px; margin: 10px 0; border-radius:10px;"><br>
                <em>${escapeHTML(auteur.faits)}</em><br><br>
                <strong>Biographie :</strong> ${escapeHTML(auteur.histoire)}<br><br>
                <strong>Études :</strong> ${escapeHTML(auteur.etudes)}<br><br>
                <strong>Écrits :</strong><ul>${auteur.ecrits.map(œuvre => `<li>${escapeHTML(œuvre)}</li>`).join('')}</ul>
                <strong>Faits marquants :</strong><ul>${auteur.faits_marquants.map(fait => `<li>${escapeHTML(fait)}</li>`).join('')}</ul>
            `;
        } catch (error) {
            console.error("Erreur chargement figures :", error);
            return `Je n’ai pas pu récupérer les informations sur l’auteur.`;
        }
    }

    if (lowerMessage.startsWith("/jurisprudence")) {
        const parts = message.trim().split(" ");
        if (parts.length < 2) return "Veuillez spécifier un nom, une date ou une année de jurisprudence.";

        const query = parts.slice(1).join(" ").toLowerCase();

        try {
            const response = await fetch("https://lesupport.me/Json/JP.json");
            if (!response.ok) throw new Error("Erreur lors du chargement des jurisprudences.");
            const data = await response.json();

            const jurisprudence = data.jurisprudences.find(jp =>
                jp.name.toLowerCase().includes(query) ||
                jp.date.toLowerCase().includes(query) ||
                jp.date.split(" ")[1].includes(query)
            );

            if (!jurisprudence) return `Aucune jurisprudence trouvée pour : <strong>${escapeHTML(query)}</strong>.`;

            return `
                <strong>${escapeHTML(jurisprudence.name)}</strong> (${escapeHTML(jurisprudence.court)})<br>
                <strong>Date : </strong>${escapeHTML(jurisprudence.date)}<br>
                <a href="${escapeHTML(jurisprudence.file)}" target="_blank">Télécharger la fiche d'arrêt</a><br>
                <img src="${escapeHTML(jurisprudence.dwld)}" alt="Télécharger la fiche d'arrêt" style="max-width: 150px; margin: 10px 0;"><br>
                <strong>Faits :</strong> ${escapeHTML(jurisprudence.facts)}<br><br>
                <strong>Résumé :</strong> ${escapeHTML(jurisprudence.summary)}
            `;
        } catch (error) {
            console.error("Erreur chargement jurisprudence :", error);
            return `Je n’ai pas pu récupérer les informations sur la jurisprudence.`;
        }
    }

    for (const intent of charonKnowledge) {
        if (intent.keywords.some(keyword => lowerMessage.includes(normalized(keyword)))) {
            return intent.response;
        }
    }

    if (charonModel) {
        const output = await charonModel(message, {
            max_new_tokens: 40,
            temperature: 0.7,
        });
        return output[0]?.generated_text || "Je réfléchis encore...";
    }

    return "Je n'ai pas trouvé de réponse. Tapez « / » pour voir ce que je peux faire.";
}

async function fetchWikipediaDefinition(term) {
    try {
        const searchUrl = `https://fr.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&utf8=&format=json&origin=*`;
        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) throw new Error("Erreur de recherche sur Wikipedia.");

        const searchData = await searchResponse.json();
        const results = searchData.query.search;
        if (!results || results.length === 0) return "Aucune définition trouvée.";

        const pageTitle = results[0].title;
        const summaryUrl = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
        const summaryResponse = await fetch(summaryUrl);
        if (!summaryResponse.ok) throw new Error("Erreur de récupération du résumé Wikipedia.");

        const summaryData = await summaryResponse.json();
        return summaryData.extract || "Aucune définition trouvée.";
    } catch (error) {
        console.error("Erreur Wikipedia :", error);
        return "Je n’ai pas pu récupérer la définition depuis l’encyclopédie.";
    }
}

// Interface utilisateur
document.addEventListener("DOMContentLoaded", () => {
    const charon = document.getElementById("charon");
    const openBtn = document.getElementById("charon-btn");
    const closeBtn = document.getElementById("charon-close");
    const charonChat = document.getElementById("charon-chat");
    const charonInput = document.getElementById("charon-input");
    const suggestionBox = document.getElementById("charon-suggestions");

    openBtn?.addEventListener("click", () => {
        charon.style.display = (charon.style.display === "none" || !charon.style.display) ? "flex" : "none";
    });

    closeBtn?.addEventListener("click", () => {
        charon.style.display = "none";
    });

    charonInput?.addEventListener("keydown", async (e) => {
        if (e.key === "Enter" && charonInput.value.trim() !== "") {
            const userMessage = charonInput.value.trim();
            charonInput.value = "";
            appendMessage("Vous", userMessage);
            appendMessage("Charon", "<em>Charon réfléchit...</em>");

            const response = await getCharonResponse(userMessage);

            const lastMessage = charonChat.querySelector("div:last-child");
            if (lastMessage && lastMessage.innerHTML.includes("réfléchit")) {
                lastMessage.remove();
            }

            appendMessage("Charon", response);
        }
    });

    charonInput.addEventListener("input", () => {
        const value = charonInput.value.trim();
        suggestionBox.innerHTML = "";

        if (value.startsWith("/")) {
            let matches = [];

            if (value === "/") {
                matches = commandSuggestions;
            } else {
                matches = commandSuggestions.filter(cmd => cmd.startsWith(value));
            }

            if (matches.length > 0) {
                matches.forEach(cmd => {
                    const option = document.createElement("div");
                    option.textContent = cmd;
                    option.className = "suggestion";
                    option.addEventListener("click", () => {
                        charonInput.value = cmd + " ";
                        suggestionBox.style.display = "none";
                        charonInput.focus();
                    });
                    suggestionBox.appendChild(option);
                });

                suggestionBox.style.display = "block";
            } else {
                suggestionBox.style.display = "none";
            }
        } else {
            suggestionBox.style.display = "none";
        }
    });

    function appendMessage(sender, message) {
        const messageDiv = document.createElement("div");
        messageDiv.innerHTML = `<strong>${sender} :</strong> ${message}`;
        charonChat.appendChild(messageDiv);
        charonChat.scrollTop = charonChat.scrollHeight;

        // Historique localStorage
        const history = JSON.parse(localStorage.getItem("charonHistory") || "[]");
        history.push({ sender, message });
        localStorage.setItem("charonHistory", JSON.stringify(history));
    }

    function restoreChatHistory() {
        const history = JSON.parse(localStorage.getItem("charonHistory") || "[]");
        for (const msg of history) {
            appendMessage(msg.sender, msg.message);
        }
    }

    // (optionnel) pour effacer
    function clearChatHistory() {
        localStorage.removeItem("charonHistory");
        charonChat.innerHTML = "";
    }
// Efface l'historique à chaque rechargement
localStorage.removeItem("charonHistory");

// Restaure l'historique (sera vide)
restoreChatHistory();
loadKnowledgeBase();
loadCodePenal();
loadCodeCivil();
loadCodeProcedureCivile();
loadCharonModel();
});
