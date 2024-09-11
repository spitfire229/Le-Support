document.getElementById('userForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Empêche l'envoi du formulaire par défaut

    function generateUniqueId() {
        return 'xxxx-xxxx-4xxx-yxxx-xxxx-xxxx-xxxx-xxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    async function checkIdExists(id) {
        const response = await fetch('../json/user_data.json');
        const users = await response.json();
        return users.some(user => user.id === id);
    }

    let userId;
    do {
        userId = generateUniqueId();
    } while (await checkIdExists(userId));

    var user = {
        "id": userId,
        "utilisateur": document.getElementById('fullName').value,
        "username": document.getElementById('username').value,
        "password": document.getElementById('password').value,
        "grade": document.getElementById('grade').value,
        "status": document.getElementById('status').textContent,
        "studies": document.getElementById('studies').value,
        "education_level": document.getElementById('educationLevel').value,
        "university": document.getElementById('university').value,
        "additional_info": document.getElementById('additionalInfo').value,
        "instagram_link": document.getElementById('instagramLink').value,
        "linkedin_link": document.getElementById('linkedinLink').value,
        "mail_link": "mailto:" + document.getElementById('mailLink').value,
        "contribution": document.getElementById('contribution').value,
        "CGU": document.getElementById('CGU').value,
        "infos-perso": document.getElementById('infos-perso').value,
    };

    if (document.getElementById('pictureHomme').checked) {
        user.picture = document.getElementById('pictureHomme').value;
    } else if (document.getElementById('pictureFemme').checked) {
        user.picture = document.getElementById('pictureFemme').value;
    }

    var texteAvantInfos = "Le mail qui suit comprend les informations relatives à votre compte.\n Il est porté à l'attention de nos usagers que ces derniers peuvent à tout moment demander la modification ou la suppression de leurs informations personnelles à cette adresse.\n\nUn mail de confirmation vous sera envoyé dès l’activation de votre compte. \n\nSi des informations vous semblent erronées, il vous est prié de ne pas toucher au code généré ci-dessous, mais de remplir le formulaire à nouveau directement sur le site ou à l’adresse suivante : http://lesupport.me/arborescence/creation%20compte.html \n \n\ntrès cordialement \n\nl'équipe du Support.\n\n";
    var mailBody = texteAvantInfos + JSON.stringify(user, null, 2);

    var mailTo = "mailto:lesuppetudiant@gmail.com" +
                 "?subject=Demande%20d'adhésion" +
                 "&body=" + encodeURIComponent(mailBody);
    window.location.href = mailTo;
});